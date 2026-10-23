// Integration checks run exclusively against the isolated local QA database.
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { readFile, mkdir, writeFile } from "node:fs/promises";

const base = "http://127.0.0.1:3100";
const db = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  multipleStatements: true,
});
await db.query(
  "CREATE DATABASE IF NOT EXISTS thunderfix_qa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; USE thunderfix_qa",
);
const schema = (
  await readFile(
    new URL("../database_scema/technician_finder_simple.sql", import.meta.url),
    "utf8",
  )
)
  .replace(/CREATE DATABASE IF NOT EXISTS[\s\S]*?;/, "")
  .replace(/USE technician_finder_simple;/, "");
await db.query(schema);
for (const sql of [
  "ALTER TABLE users ADD COLUMN latitude DECIMAL(10,7) NULL",
  "ALTER TABLE users ADD COLUMN longitude DECIMAL(10,7) NULL",
  "ALTER TABLE users ADD COLUMN address_text TEXT NULL",
  "ALTER TABLE jobs ADD COLUMN final_price DECIMAL(10,2) NULL",
  "ALTER TABLE technician_services ADD COLUMN experience_years TINYINT UNSIGNED NULL",
]) {
  try {
    await db.query(sql);
  } catch (e) {
    if (e.code !== "ER_DUP_FIELDNAME") throw e;
  }
}
await db.query(
  await readFile(
    new URL("../database_scema/002_urgent_dispatch.sql", import.meta.url),
    "utf8",
  ),
);
const stamp = Date.now();
const readiness = await fetch(`${base}/api/health`).then((r) => r.json());
assert.equal(
  readiness.data?.isolatedQa,
  true,
  "Refusing to test: server must use THUNDERFIX_QA=1 and isolated thunderfix_qa on port 3307",
);
const secret = process.env.JWT_SECRET;
assert.ok(secret, "Load local .env for signing isolated QA sessions");
async function user(role, name, latitude = 13.7563, longitude = 100.5018) {
  const email = `qa-${role}-${Math.random().toString(36).slice(2)}-${stamp}@example.test`;
  const [row] = await db.execute(
    "INSERT INTO users (full_name,email,password_hash,role) VALUES (?,?,?,?)",
    [name, email, await bcrypt.hash("QaOnly-NotRealAccount", 4), role],
  );
  const id = String(row.insertId);
  if (role === "technician") {
    const [tp] = await db.execute(
      "INSERT INTO technician_profiles (user_id,latitude,longitude,service_radius_km) VALUES (?,?,?,?)",
      [id, latitude, longitude, 20],
    );
    await db.execute(
      "INSERT INTO technician_services (technician_id,category_id) VALUES (?,1)",
      [tp.insertId],
    );
  }
  return {
    id,
    cookie: `technician_finder_token=${jwt.sign({ userId: id, email, role }, secret, { algorithm: "HS256", expiresIn: "1h" })}`,
    name,
  };
}
const customer = await user("customer", "ลูกค้าทดสอบ");
const stranger = await user("customer", "ลูกค้าอีกคน");
const near = await user("technician", "ช่างใกล้บ้าน");
const near2 = await user("technician", "ช่างพร้อมช่วย");
const far = await user("technician", "ช่างนอกพื้นที่", 18.7883, 98.9853);
async function request(u, payload, expected = 200) {
  const r = await fetch(`${base}/api/dispatch`, {
    method: payload ? "POST" : "GET",
    headers: {
      Cookie: u?.cookie || "",
      ...(payload ? { "Content-Type": "application/json" } : {}),
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  const data = await r.json();
  assert.equal(r.status, expected, JSON.stringify(data));
  return data;
}
let passed = 0;
function pass(name) {
  passed++;
  console.log(`PASS ${name}`);
}
try {
  await request(null, null, 401);
  pass("unauthenticated access denied");
  await request(near, { action: "publish" }, 403);
  pass("technician cannot publish as customer");
  await request(
    customer,
    { action: "publish", categoryId: "1", title: "x" },
    400,
  );
  pass("invalid job rejected");
  const job = {
    action: "publish",
    categoryId: "1",
    title: "แอร์ไม่เย็น ต้องการช่างด่วน",
    description: "แอร์เปิดติดแต่มีแต่ลม ไม่เย็น ต้องการตรวจสอบ",
    addressText: "ที่อยู่ทดสอบสำหรับ QA",
    latitude: 13.7563,
    longitude: 100.5018,
    radiusKm: 10,
    budgetMax: 1200,
  };
  const { jobId } = await request(customer, job, 201);
  pass("customer publishes persisted urgent job");
  await request(customer, job, 409);
  pass("duplicate active broadcast rejected");
  for (const [u, lat, lng] of [
    [near, 13.7583, 100.5038],
    [near2, 13.7603, 100.5058],
    [far, 18.7883, 98.9853],
  ])
    await request(u, {
      action: "presence",
      online: true,
      latitude: lat,
      longitude: lng,
    });
  let feed = await request(near);
  assert.ok(feed.jobs.some((j) => j.id === jobId));
  assert.ok(feed.jobs.find((j) => j.id === jobId).distanceKm < 1);
  pass("nearby matching technician receives job");
  await db.execute(
    "UPDATE technician_profiles SET service_radius_km=0.1 WHERE user_id=?",
    [near.id],
  );
  assert.ok(!(await request(near)).jobs.some((j) => j.id === jobId));
  await db.execute(
    "UPDATE technician_profiles SET service_radius_km=20 WHERE user_id=?",
    [near.id],
  );
  pass("technician's own service radius is respected");
  await db.execute(
    "UPDATE technician_services ts JOIN technician_profiles tp ON tp.id=ts.technician_id SET ts.category_id=2 WHERE tp.user_id=?",
    [near2.id],
  );
  assert.ok(!(await request(near2)).jobs.some((j) => j.id === jobId));
  await request(
    near2,
    { action: "offer", jobId, price: 500, etaMinutes: 30, note: "" },
    403,
  );
  await db.execute(
    "UPDATE technician_services ts JOIN technician_profiles tp ON tp.id=ts.technician_id SET ts.category_id=1 WHERE tp.user_id=?",
    [near2.id],
  );
  pass("mismatched service category is excluded from feed and offers");
  const privateJob = feed.jobs.find((j) => j.id === jobId);
  assert.ok(!("addressText" in privateJob) && !("latitude" in privateJob));
  pass("feed omits exact customer address and coordinates");
  feed = await request(far);
  assert.ok(!feed.jobs.some((j) => j.id === jobId));
  pass("outside-radius technician excluded");
  await request(
    far,
    { action: "offer", jobId, price: 500, etaMinutes: 30, note: "" },
    403,
  );
  pass("forged outside-radius offer rejected");
  await request(
    near,
    { action: "offer", jobId, price: -1, etaMinutes: 30, note: "" },
    400,
  );
  pass("negative offer rejected");
  await request(near, {
    action: "offer",
    jobId,
    price: 700,
    etaMinutes: 25,
    note: "รวมค่าเดินทาง ยังไม่รวมอะไหล่",
  });
  pass("technician submits quote and ETA");
  await request(
    near,
    { action: "offer", jobId, price: 700, etaMinutes: 25, note: "" },
    409,
  );
  pass("duplicate quote rejected");
  await request(near2, {
    action: "offer",
    jobId,
    price: 650,
    etaMinutes: 30,
    note: "พร้อมเข้าตรวจสอบ",
  });
  const own = (await request(customer)).jobs.find((j) => j.id === jobId);
  assert.equal(own.offers.length, 2);
  assert.ok(Date.parse(own.expiresAt) - Date.now() > 25 * 60000);
  pass("customer receives both quotes with correct UTC expiry");
  await request(
    stranger,
    { action: "choose", jobId, offerId: own.offers[0].id },
    404,
  );
  pass("other customer cannot select a quote");
  const choices = await Promise.all(
    own.offers.map((o) =>
      fetch(`${base}/api/dispatch`, {
        method: "POST",
        headers: {
          Cookie: customer.cookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "choose", jobId, offerId: o.id }),
      }),
    ),
  );
  assert.deepEqual(choices.map((r) => r.status).sort(), [200, 409]);
  pass("concurrent selection assigns exactly one technician");
  const [selected] = await db.execute("SELECT * FROM jobs WHERE id=?", [jobId]);
  assert.equal(selected[0].status, "accepted");
  const chosen = String(selected[0].technician_id) === near.id ? near : near2;
  const notChosen = chosen.id === near.id ? near2 : near;
  assert.ok(
    (await request(chosen)).myOffers.some(
      (o) => o.jobId === jobId && o.selected,
    ),
  );
  pass("chosen technician can track successful quote");
  await request(
    notChosen,
    { action: "progress", jobId, status: "on_the_way" },
    409,
  );
  await request(
    customer,
    { action: "progress", jobId, status: "on_the_way" },
    403,
  );
  pass("only assigned technician can advance the job");
  await request(
    chosen,
    { action: "progress", jobId, status: "in_progress" },
    409,
  );
  await request(chosen, { action: "progress", jobId, status: "on_the_way" });
  assert.equal(
    (await request(customer)).jobs.find((j) => j.id === jobId).status,
    "on_the_way",
  );
  await request(chosen, { action: "progress", jobId, status: "in_progress" });
  assert.equal(
    (await request(customer)).jobs.find((j) => j.id === jobId).status,
    "in_progress",
  );
  pass("travel and work states advance in order and reach the customer");
  const privateDetails = await fetch(
    `${base}/dashboard/technician/jobs/${jobId}`,
    { headers: { Cookie: notChosen.cookie }, redirect: "manual" },
  );
  assert.ok([303, 307].includes(privateDetails.status));
  pass("unselected technician cannot read exact address from job details");
  const [rooms] = await db.execute("SELECT * FROM chat_rooms WHERE job_id=?", [
    jobId,
  ]);
  assert.equal(rooms.length, 1);
  pass("chosen job and one chat room persisted");
  const roomId = String(rooms[0].id);
  const sendChat = (u, role, message) =>
    fetch(`${base}/api/${role}/chat/${roomId}`, {
      method: "POST",
      headers: { Cookie: u.cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  assert.equal(
    (await sendChat(chosen, "technician", "สวัสดีครับ กำลังเตรียมเครื่องมือ"))
      .status,
    200,
  );
  assert.equal(
    (await sendChat(customer, "customer", "ขอบคุณครับ กรุณาแจ้งเมื่อใกล้ถึง"))
      .status,
    200,
  );
  assert.equal(
    (await sendChat(notChosen, "technician", "ข้อความที่ไม่ได้รับอนุญาต"))
      .status,
    403,
  );
  assert.equal(
    (await sendChat(stranger, "customer", "ข้อความที่ไม่ได้รับอนุญาต")).status,
    403,
  );
  pass(
    "matched participants can chat; unrelated accounts cannot send messages",
  );
  await fetch(`${base}/api/technician/chat/start`, {
    method: "POST",
    headers: { Cookie: notChosen.cookie },
    body: new URLSearchParams({ jobId, customerId: customer.id }),
    redirect: "manual",
  });
  const [protectedRooms] = await db.execute(
    "SELECT id FROM chat_rooms WHERE job_id=?",
    [jobId],
  );
  assert.equal(protectedRooms.length, 1);
  pass("unselected technician cannot forge another job chat room");
  await request(customer, { action: "cancel", jobId }, 409);
  pass("accepted job cannot be cancelled via urgent waiting flow");
  assert.ok(!(await request(near)).jobs.some((j) => j.id === jobId));
  pass("selected job removed from nearby feed");
  const next = await request(customer, job, 201);
  await request(near, {
    action: "offer",
    jobId: next.jobId,
    price: 500,
    etaMinutes: 30,
    note: "ทดสอบหมดเวลา",
  });
  const expiringOffer = (await request(customer)).jobs.find(
    (j) => j.id === next.jobId,
  ).offers[0];
  await db.execute(
    "UPDATE urgent_dispatch SET expires_at=UTC_TIMESTAMP()-INTERVAL 1 SECOND WHERE job_id=?",
    [next.jobId],
  );
  await request(
    near,
    {
      action: "offer",
      jobId: next.jobId,
      price: 500,
      etaMinutes: 30,
      note: "",
    },
    409,
  );
  pass("expired broadcast rejects responses");
  await request(
    customer,
    { action: "choose", jobId: next.jobId, offerId: expiringOffer.id },
    409,
  );
  pass("expired broadcast rejects late customer selection");
  const cancelled = await request(customer, job, 201);
  await request(customer, { action: "cancel", jobId: cancelled.jobId });
  assert.equal(
    (await request(customer)).jobs.find((j) => j.id === cancelled.jobId).status,
    "cancelled",
  );
  pass("customer cancellation persists");
  await db.execute(
    "UPDATE urgent_presence SET last_seen=UTC_TIMESTAMP()-INTERVAL 91 SECOND WHERE user_id=?",
    [near.id],
  );
  assert.equal((await request(near)).online, false);
  pass("stale technician automatically marked offline");
  await request(near2, {
    action: "presence",
    online: false,
    latitude: 13.76,
    longitude: 100.5,
  });
  assert.equal((await request(near2)).online, false);
  pass("availability toggle persists");
  await request(near, {
    action: "presence",
    online: true,
    latitude: 13.7583,
    longitude: 100.5038,
  });
  await mkdir(new URL("../.qa/", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../.qa/sessions.json", import.meta.url),
    JSON.stringify({ customer, technician: chosen }),
  );
  // HTTP-render every screen in both role areas, including the newly matched job.
  const pages = {
    customer: [
      "",
      "urgent",
      "explore",
      "jobs",
      "jobs/new",
      `jobs/${jobId}`,
      "profile",
      "chat",
    ],
    technician: [
      "",
      "urgent",
      "explore",
      "jobs",
      "requests",
      "services",
      `jobs/${jobId}`,
      "profile",
      "chat",
    ],
  };
  for (const [role, paths] of Object.entries(pages))
    for (const path of paths) {
      const r = await fetch(`${base}/dashboard/${role}/${path}`, {
        headers: { Cookie: (role === "customer" ? customer : chosen).cookie },
      });
      const html = await r.text();
      assert.equal(r.status, 200, `${role}/${path}`);
      assert.ok(
        !html.includes("NEXT_HTTP_ERROR_FALLBACK;500"),
        `${role}/${path}`,
      );
      if (html.includes('"digest":') || html.includes('"digest"\\:'))
        console.log(`CHECK streamed digest: ${role}/${path}`);
    }
  pass("17 authenticated dashboard routes return HTML successfully");
  const unauth = await fetch(`${base}/dashboard/customer/urgent`, {
    redirect: "manual",
  });
  assert.ok(
    unauth.headers
      .get("location")
      .includes("next=%2Fdashboard%2Fcustomer%2Furgent"),
  );
  pass("login redirect preserves intended urgent page");
  const invalidJson = await fetch(`${base}/api/dispatch`, {
    method: "POST",
    headers: { Cookie: customer.cookie, "Content-Type": "application/json" },
    body: "null",
  });
  assert.equal(invalidJson.status, 400);
  pass("malformed action payload returns a validation error");
  const crossOrigin = await fetch(`${base}/api/dispatch`, {
    method: "POST",
    headers: {
      Cookie: customer.cookie,
      "Content-Type": "application/json",
      Origin: "https://unrelated.example",
    },
    body: JSON.stringify({ action: "cancel", jobId }),
  });
  assert.equal(crossOrigin.status, 403);
  pass("cross-origin mutation is rejected");
  const search = await fetch(
    `${base}/dashboard/customer/explore?q=NoMatchingServiceQA`,
    { headers: { Cookie: customer.cookie } },
  ).then((r) => r.text());
  assert.ok(search.includes("ไม่พบช่างที่ตรงกับเงื่อนไข"));
  pass("keyword search filters actual service results");
  const loginHtml = await fetch(`${base}/login?join=technician`).then((r) =>
    r.text(),
  );
  assert.ok(
    loginHtml.includes("เริ่มต้นกับ ThunderFix") &&
      loginHtml.includes("รัศมีพื้นที่รับงาน"),
  );
  pass("partner entry opens technician registration with location fields");
  console.log(
    `${passed} integration checks passed. Test data stays in isolated thunderfix_qa on port 3307.`,
  );
} finally {
  await db.end();
}
