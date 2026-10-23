import type {
  PoolConnection,
  RowDataPacket,
  ResultSetHeader,
} from "mysql2/promise";
import { db } from "@/lib/db";
import {
  distanceKm,
  type DispatchJob,
  type DispatchSnapshot,
  type UrgentJobInput,
  type OfferInput,
} from "@/lib/dispatch";

export class DispatchError extends Error {
  constructor(
    message: string,
    public status = 409,
  ) {
    super(message);
  }
}
const distanceSql = `(6371 * 2 * ASIN(SQRT(LEAST(1, POW(SIN(RADIANS(j.latitude - p.latitude) / 2), 2) + COS(RADIANS(p.latitude)) * COS(RADIANS(j.latitude)) * POW(SIN(RADIANS(j.longitude - p.longitude) / 2), 2)))))`;

async function transaction<T>(
  fn: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
  const c = await db.getConnection();
  try {
    await c.beginTransaction();
    const result = await fn(c);
    await c.commit();
    return result;
  } catch (error) {
    await c.rollback();
    throw error;
  } finally {
    c.release();
  }
}

export async function getDispatchSnapshot(
  userId: string,
  role: "customer" | "technician",
): Promise<DispatchSnapshot> {
  let rows: RowDataPacket[];
  let online = false;
  let location = null;
  if (role === "technician") {
    // Presence expires when the dashboard is closed, even if no offline request arrives.
    const [presence] = await db.execute<RowDataPacket[]>(
      `SELECT latitude, longitude, online AND last_seen > UTC_TIMESTAMP() - INTERVAL 90 SECOND AS online FROM urgent_presence WHERE user_id = ?`,
      [userId],
    );
    online = !!presence[0]?.online;
    if (presence[0])
      location = {
        latitude: Number(presence[0].latitude),
        longitude: Number(presence[0].longitude),
      };
    [rows] = await db.execute<RowDataPacket[]>(
      `SELECT j.*, sc.name AS category_name, d.radius_km, DATE_FORMAT(d.expires_at, '%Y-%m-%dT%H:%i:%sZ') AS expires_iso, ${distanceSql} AS distance_km,
      EXISTS(SELECT 1 FROM urgent_offers o WHERE o.job_id = j.id AND o.technician_id = ?) AS has_offered
      FROM jobs j JOIN urgent_dispatch d ON d.job_id = j.id JOIN service_categories sc ON sc.id = j.category_id
      JOIN urgent_presence p ON p.user_id = ? JOIN technician_profiles tp ON tp.user_id = p.user_id
      WHERE j.status = 'requested' AND j.technician_id IS NULL AND d.expires_at > UTC_TIMESTAMP()
        AND p.online = 1 AND p.last_seen > UTC_TIMESTAMP() - INTERVAL 90 SECOND
        AND EXISTS (SELECT 1 FROM technician_services ts WHERE ts.technician_id = tp.id AND ts.category_id = j.category_id)
      HAVING distance_km <= LEAST(radius_km, (SELECT service_radius_km FROM technician_profiles WHERE user_id = ?))
      ORDER BY distance_km, j.created_at DESC LIMIT 30`,
      [userId, userId, userId],
    );
  } else {
    [rows] = await db.execute<RowDataPacket[]>(
      `SELECT j.*, sc.name AS category_name, d.radius_km, DATE_FORMAT(d.expires_at, '%Y-%m-%dT%H:%i:%sZ') AS expires_iso FROM jobs j JOIN urgent_dispatch d ON d.job_id = j.id JOIN service_categories sc ON sc.id = j.category_id WHERE j.customer_id = ? ORDER BY j.created_at DESC LIMIT 5`,
      [userId],
    );
  }
  const jobs: DispatchJob[] = [];
  for (const row of rows) {
    const [offers] =
      role === "customer"
        ? await db.execute<RowDataPacket[]>(
            `SELECT o.*, u.full_name, tp.average_rating, tp.total_reviews FROM urgent_offers o JOIN users u ON u.id = o.technician_id JOIN technician_profiles tp ON tp.user_id = u.id WHERE o.job_id = ? AND u.status = 'active' ORDER BY o.created_at`,
            [row.id],
          )
        : [[]];
    jobs.push({
      id: String(row.id),
      title: row.title,
      description: row.description,
      category: row.category_name,
      categoryId: String(row.category_id),
      status: row.status,
      radiusKm: Number(row.radius_km),
      expiresAt: row.expires_iso,
      distanceKm: row.distance_km == null ? null : Number(row.distance_km),
      budgetMax: row.budget_max == null ? null : Number(row.budget_max),
      hasOffered: !!row.has_offered,
      offers: offers.map((o) => ({
        id: String(o.id),
        technicianId: String(o.technician_id),
        name: o.full_name,
        rating: Number(o.average_rating),
        reviews: Number(o.total_reviews),
        price: Number(o.price),
        etaMinutes: Number(o.eta_minutes),
        note: o.note,
      })),
    });
  }
  const [myOffers] =
    role === "technician"
      ? await db.execute<RowDataPacket[]>(
          `SELECT j.id, j.title, j.status, j.technician_id, o.price, DATE_FORMAT(d.expires_at, '%Y-%m-%dT%H:%i:%sZ') AS expires_iso FROM urgent_offers o JOIN jobs j ON j.id = o.job_id JOIN urgent_dispatch d ON d.job_id = j.id WHERE o.technician_id = ? ORDER BY o.created_at DESC LIMIT 15`,
          [userId],
        )
      : [[]];
  return {
    jobs,
    myOffers: myOffers.map((o) => ({
      jobId: String(o.id),
      title: o.title,
      status: o.status,
      selected: String(o.technician_id) === userId,
      price: Number(o.price),
      expiresAt: o.expires_iso,
    })),
    online,
    location,
  };
}

export async function publishUrgentJob(userId: string, input: UrgentJobInput) {
  return transaction(async (c) => {
    await c.execute(`SELECT id FROM users WHERE id = ? FOR UPDATE`, [userId]);
    const [active] = await c.execute<RowDataPacket[]>(
      `SELECT j.id FROM jobs j JOIN urgent_dispatch d ON d.job_id = j.id WHERE j.customer_id = ? AND j.status = 'requested' AND d.expires_at > UTC_TIMESTAMP()`,
      [userId],
    );
    if (active.length)
      throw new DispatchError(
        "คุณมีประกาศด่วนที่กำลังหาช่างอยู่แล้ว ไปที่ติดตามงานเพื่อดูคำตอบ",
      );
    const [categories] = await c.execute<RowDataPacket[]>(
      `SELECT id FROM service_categories WHERE id = ? AND is_active = 1`,
      [input.categoryId],
    );
    if (!categories.length)
      throw new DispatchError("กรุณาเลือกประเภทงานที่เปิดให้บริการ", 400);
    const [result] = await c.execute<ResultSetHeader>(
      `INSERT INTO jobs (customer_id, category_id, title, description, address_text, latitude, longitude, budget_max) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        input.categoryId,
        input.title,
        input.description,
        input.addressText,
        input.latitude,
        input.longitude,
        input.budgetMax ?? null,
      ],
    );
    const jobId = String(result.insertId);
    await c.execute(
      `INSERT INTO urgent_dispatch (job_id, radius_km, expires_at) VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL 30 MINUTE)`,
      [jobId, input.radiusKm],
    );
    return jobId;
  });
}

export async function setPresence(
  userId: string,
  input: { online: boolean; latitude: number; longitude: number },
) {
  await db.execute(
    `INSERT INTO urgent_presence (user_id, latitude, longitude, online, last_seen) VALUES (?, ?, ?, ?, UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE latitude = VALUES(latitude), longitude = VALUES(longitude), online = VALUES(online), last_seen = UTC_TIMESTAMP()`,
    [userId, input.latitude, input.longitude, input.online],
  );
}

export async function submitUrgentOffer(userId: string, input: OfferInput) {
  await transaction(async (c) => {
    const [jobs] = await c.execute<RowDataPacket[]>(
      `SELECT j.*, d.radius_km, d.expires_at > UTC_TIMESTAMP() AS unexpired FROM jobs j JOIN urgent_dispatch d ON d.job_id = j.id WHERE j.id = ? FOR UPDATE`,
      [input.jobId],
    );
    const j = jobs[0];
    if (!j || j.status !== "requested" || j.technician_id || !j.unexpired)
      throw new DispatchError("งานนี้หมดเวลาหรือมีช่างรับแล้ว");
    const [technicians] = await c.execute<RowDataPacket[]>(
      `SELECT p.*, tp.service_radius_km FROM urgent_presence p JOIN technician_profiles tp ON tp.user_id = p.user_id WHERE p.user_id = ? AND p.online = 1 AND p.last_seen > UTC_TIMESTAMP() - INTERVAL 90 SECOND AND EXISTS(SELECT 1 FROM technician_services ts WHERE ts.technician_id = tp.id AND ts.category_id = ?)`,
      [userId, j.category_id],
    );
    const t = technicians[0];
    if (
      !t ||
      distanceKm(
        { latitude: Number(j.latitude), longitude: Number(j.longitude) },
        { latitude: Number(t.latitude), longitude: Number(t.longitude) },
      ) > Math.min(Number(j.radius_km), Number(t.service_radius_km))
    )
      throw new DispatchError(
        "งานอยู่นอกพื้นที่หรือไม่ตรงกับบริการที่คุณรับ",
        403,
      );
    const [existing] = await c.execute<RowDataPacket[]>(
      `SELECT id FROM urgent_offers WHERE job_id = ? AND technician_id = ?`,
      [input.jobId, userId],
    );
    if (existing.length)
      throw new DispatchError("ส่งข้อเสนอแล้ว กรุณารอลูกค้าเลือกช่าง");
    await c.execute(
      `INSERT INTO urgent_offers (job_id, technician_id, price, eta_minutes, note) VALUES (?, ?, ?, ?, ?)`,
      [input.jobId, userId, input.price, input.etaMinutes, input.note],
    );
    await c.execute(
      `INSERT INTO notifications (user_id, title, message, related_job_id) VALUES (?, 'มีช่างตอบรับงานด่วน', 'มีข้อเสนอใหม่ ดูราคาและเวลาที่ช่างพร้อมไปถึงได้ที่หน้าเรียกด่วน', ?)`,
      [j.customer_id, input.jobId],
    );
  });
}

export async function chooseUrgentOffer(
  userId: string,
  jobId: string,
  offerId: string,
) {
  return transaction(async (c) => {
    const [jobs] = await c.execute<RowDataPacket[]>(
      `SELECT j.*, d.expires_at > UTC_TIMESTAMP() AS unexpired FROM jobs j JOIN urgent_dispatch d ON d.job_id = j.id WHERE j.id = ? FOR UPDATE`,
      [jobId],
    );
    const j = jobs[0];
    if (!j || String(j.customer_id) !== userId)
      throw new DispatchError("ไม่พบงานนี้", 404);
    if (j.status !== "requested" || j.technician_id || !j.unexpired)
      throw new DispatchError("งานนี้หมดเวลาหรือเลือกช่างแล้ว กรุณารีเฟรช");
    const [offers] = await c.execute<RowDataPacket[]>(
      `SELECT o.* FROM urgent_offers o JOIN users u ON u.id = o.technician_id AND u.status = 'active' WHERE o.id = ? AND o.job_id = ?`,
      [offerId, jobId],
    );
    const offer = offers[0];
    if (!offer) throw new DispatchError("ไม่พบข้อเสนอ", 404);
    await c.execute(
      `UPDATE jobs SET technician_id = ?, status = 'accepted', budget_min = ?, budget_max = ? WHERE id = ?`,
      [offer.technician_id, offer.price, offer.price, jobId],
    );
    await c.execute(
      `INSERT INTO job_requests (job_id, technician_id, message, quoted_price, status, responded_at) VALUES (?, ?, ?, ?, 'accepted', NOW()) ON DUPLICATE KEY UPDATE status = 'accepted', responded_at = NOW(), quoted_price = VALUES(quoted_price)`,
      [jobId, offer.technician_id, offer.note, offer.price],
    );
    await c.execute(
      `UPDATE job_requests SET status = 'rejected', responded_at = NOW() WHERE job_id = ? AND technician_id <> ? AND status = 'pending'`,
      [jobId, offer.technician_id],
    );
    const [room] = await c.execute<ResultSetHeader>(
      `INSERT INTO chat_rooms (job_id, customer_id, technician_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
      [jobId, userId, offer.technician_id],
    );
    await c.execute(
      `INSERT INTO notifications (user_id, title, message, related_job_id) VALUES (?, 'ลูกค้าเลือกคุณแล้ว', 'เปิดงานเพื่อคุยรายละเอียดและยืนยันการเดินทางกับลูกค้า', ?)`,
      [offer.technician_id, jobId],
    );
    return { jobId, roomId: String(room.insertId) };
  });
}

export async function cancelUrgentJob(userId: string, jobId: string) {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE jobs j JOIN urgent_dispatch d ON d.job_id = j.id SET j.status = 'cancelled' WHERE j.id = ? AND j.customer_id = ? AND j.status = 'requested' AND j.technician_id IS NULL`,
    [jobId, userId],
  );
  if (!result.affectedRows)
    throw new DispatchError("ยกเลิกไม่ได้ งานอาจมีช่างรับแล้ว");
}

export async function progressJob(
  userId: string,
  jobId: string,
  status: "on_the_way" | "in_progress",
) {
  await transaction(async (c) => {
    const previous = status === "on_the_way" ? "accepted" : "on_the_way";
    const [jobs] = await c.execute<RowDataPacket[]>(
      `SELECT * FROM jobs WHERE id = ? AND technician_id = ? FOR UPDATE`,
      [jobId, userId],
    );
    const job = jobs[0];
    if (!job || job.status !== previous)
      throw new DispatchError("ไม่สามารถเปลี่ยนสถานะได้ กรุณารีเฟรชงาน");
    await c.execute(`UPDATE jobs SET status = ? WHERE id = ?`, [status, jobId]);
    await c.execute(
      `INSERT INTO notifications (user_id, title, message, related_job_id) VALUES (?, ?, ?, ?)`,
      [
        job.customer_id,
        status === "on_the_way" ? "ช่างกำลังเดินทาง" : "ช่างเริ่มดำเนินงานแล้ว",
        job.title,
        jobId,
      ],
    );
  });
}
