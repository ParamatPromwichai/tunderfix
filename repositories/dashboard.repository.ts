import { type RowDataPacket } from "mysql2";

import { db } from "@/lib/db";

export interface DashboardTable {
  key: string;
  title: string;
  tableName: string;
  description: string;
  total: number;
  columns: string[];
  rows: Record<string, string>[];
}

type CountRow = RowDataPacket & {
  total: number | string;
};

type DisplayRow = RowDataPacket & Record<string, unknown>;

const tableCounts = [
  "users",
  "technician_profiles",
  "service_categories",
  "technician_services",
  "jobs",
  "job_requests",
  "chat_rooms",
  "chat_messages",
  "reviews",
  "notifications",
] as const;

function stringifyCell(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "ใช่" : "ไม่";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("th-TH").format(value);
  }

  return String(value);
}

function mapRows(rows: DisplayRow[]): Record<string, string>[] {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, stringifyCell(value)]),
    ),
  );
}

async function countTable(tableName: (typeof tableCounts)[number]) {
  const [rows] = await db.execute<CountRow[]>(
    `SELECT COUNT(*) AS total FROM ${tableName}`,
  );

  return Number(rows[0]?.total) || 0;
}

async function queryRows(sql: string) {
  const [rows] = await db.execute<DisplayRow[]>(sql);
  return mapRows(rows);
}

export async function getDashboardTables(): Promise<DashboardTable[]> {
  const [
    usersTotal,
    profilesTotal,
    categoriesTotal,
    technicianServicesTotal,
    jobsTotal,
    jobRequestsTotal,
    chatRoomsTotal,
    chatMessagesTotal,
    reviewsTotal,
    notificationsTotal,
  ] = await Promise.all(tableCounts.map((tableName) => countTable(tableName)));

  const [
    usersRows,
    profileRows,
    categoryRows,
    technicianServiceRows,
    jobRows,
    jobRequestRows,
    chatRoomRows,
    chatMessageRows,
    reviewRows,
    notificationRows,
  ] = await Promise.all([
    queryRows(`
      SELECT
        id AS "ID",
        full_name AS "ชื่อ",
        email AS "อีเมล",
        role AS "บทบาท",
        status AS "สถานะ",
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS "สร้างเมื่อ"
      FROM users
      ORDER BY created_at DESC
      LIMIT 6
    `),
    queryRows(`
      SELECT
        tp.id AS "ID",
        u.full_name AS "ช่าง",
        tp.years_experience AS "ปีประสบการณ์",
        tp.service_radius_km AS "รัศมี กม.",
        IF(tp.is_available, 'ว่าง', 'ไม่ว่าง') AS "พร้อมรับงาน",
        tp.verification_status AS "ตรวจสอบ",
        tp.average_rating AS "คะแนน"
      FROM technician_profiles tp
      INNER JOIN users u ON u.id = tp.user_id
      ORDER BY tp.updated_at DESC
      LIMIT 6
    `),
    queryRows(`
      SELECT
        id AS "ID",
        name AS "หมวด",
        description AS "รายละเอียด",
        IF(is_active, 'เปิดใช้', 'ปิดใช้') AS "สถานะ",
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS "สร้างเมื่อ"
      FROM service_categories
      ORDER BY created_at DESC
      LIMIT 6
    `),
    queryRows(`
      SELECT
        ts.id AS "ID",
        u.full_name AS "ช่าง",
        sc.name AS "หมวด",
        ts.price_min AS "ราคาต่ำสุด",
        ts.price_max AS "ราคาสูงสุด",
        DATE_FORMAT(ts.created_at, '%Y-%m-%d %H:%i') AS "สร้างเมื่อ"
      FROM technician_services ts
      INNER JOIN technician_profiles tp ON tp.id = ts.technician_id
      INNER JOIN users u ON u.id = tp.user_id
      INNER JOIN service_categories sc ON sc.id = ts.category_id
      ORDER BY ts.created_at DESC
      LIMIT 6
    `),
    queryRows(`
      SELECT
        j.id AS "ID",
        j.title AS "งาน",
        customer.full_name AS "ลูกค้า",
        COALESCE(technician.full_name, '-') AS "ช่าง",
        sc.name AS "หมวด",
        j.status AS "สถานะ",
        DATE_FORMAT(j.created_at, '%Y-%m-%d %H:%i') AS "สร้างเมื่อ"
      FROM jobs j
      INNER JOIN users customer ON customer.id = j.customer_id
      LEFT JOIN users technician ON technician.id = j.technician_id
      INNER JOIN service_categories sc ON sc.id = j.category_id
      ORDER BY j.created_at DESC
      LIMIT 6
    `),
    queryRows(`
      SELECT
        jr.id AS "ID",
        j.title AS "งาน",
        u.full_name AS "ช่าง",
        jr.status AS "สถานะ",
        jr.quoted_price AS "ราคาเสนอ",
        DATE_FORMAT(jr.created_at, '%Y-%m-%d %H:%i') AS "สร้างเมื่อ"
      FROM job_requests jr
      INNER JOIN jobs j ON j.id = jr.job_id
      INNER JOIN users u ON u.id = jr.technician_id
      ORDER BY jr.created_at DESC
      LIMIT 6
    `),
    queryRows(`
      SELECT
        cr.id AS "ID",
        j.title AS "งาน",
        customer.full_name AS "ลูกค้า",
        technician.full_name AS "ช่าง",
        DATE_FORMAT(cr.created_at, '%Y-%m-%d %H:%i') AS "สร้างเมื่อ"
      FROM chat_rooms cr
      INNER JOIN jobs j ON j.id = cr.job_id
      INNER JOIN users customer ON customer.id = cr.customer_id
      INNER JOIN users technician ON technician.id = cr.technician_id
      ORDER BY cr.created_at DESC
      LIMIT 6
    `),
    queryRows(`
      SELECT
        cm.id AS "ID",
        j.title AS "งาน",
        sender.full_name AS "ผู้ส่ง",
        LEFT(cm.message, 80) AS "ข้อความ",
        IF(cm.is_read, 'อ่านแล้ว', 'ยังไม่อ่าน') AS "อ่าน",
        DATE_FORMAT(cm.created_at, '%Y-%m-%d %H:%i') AS "ส่งเมื่อ"
      FROM chat_messages cm
      INNER JOIN chat_rooms cr ON cr.id = cm.room_id
      INNER JOIN jobs j ON j.id = cr.job_id
      INNER JOIN users sender ON sender.id = cm.sender_id
      ORDER BY cm.created_at DESC
      LIMIT 6
    `),
    queryRows(`
      SELECT
        r.id AS "ID",
        j.title AS "งาน",
        customer.full_name AS "ลูกค้า",
        technician.full_name AS "ช่าง",
        r.rating AS "คะแนน",
        LEFT(r.comment, 80) AS "รีวิว",
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i') AS "สร้างเมื่อ"
      FROM reviews r
      INNER JOIN jobs j ON j.id = r.job_id
      INNER JOIN users customer ON customer.id = r.customer_id
      INNER JOIN users technician ON technician.id = r.technician_id
      ORDER BY r.created_at DESC
      LIMIT 6
    `),
    queryRows(`
      SELECT
        n.id AS "ID",
        u.full_name AS "ผู้ใช้",
        n.title AS "หัวข้อ",
        LEFT(n.message, 80) AS "ข้อความ",
        IF(n.is_read, 'อ่านแล้ว', 'ยังไม่อ่าน') AS "อ่าน",
        DATE_FORMAT(n.created_at, '%Y-%m-%d %H:%i') AS "สร้างเมื่อ"
      FROM notifications n
      INNER JOIN users u ON u.id = n.user_id
      ORDER BY n.created_at DESC
      LIMIT 6
    `),
  ]);

  return [
    {
      key: "users",
      title: "ผู้ใช้",
      tableName: "users",
      description: "บัญชีลูกค้า ช่าง และแอดมิน",
      total: usersTotal,
      columns: ["ID", "ชื่อ", "อีเมล", "บทบาท", "สถานะ", "สร้างเมื่อ"],
      rows: usersRows,
    },
    {
      key: "technician_profiles",
      title: "โปรไฟล์ช่าง",
      tableName: "technician_profiles",
      description: "ข้อมูลตำแหน่ง ความพร้อม และการตรวจสอบช่าง",
      total: profilesTotal,
      columns: [
        "ID",
        "ช่าง",
        "ปีประสบการณ์",
        "รัศมี กม.",
        "พร้อมรับงาน",
        "ตรวจสอบ",
        "คะแนน",
      ],
      rows: profileRows,
    },
    {
      key: "service_categories",
      title: "หมวดบริการ",
      tableName: "service_categories",
      description: "ประเภทงานซ่อมที่ระบบรองรับ",
      total: categoriesTotal,
      columns: ["ID", "หมวด", "รายละเอียด", "สถานะ", "สร้างเมื่อ"],
      rows: categoryRows,
    },
    {
      key: "technician_services",
      title: "บริการของช่าง",
      tableName: "technician_services",
      description: "หมวดงานและช่วงราคาที่ช่างรับทำ",
      total: technicianServicesTotal,
      columns: ["ID", "ช่าง", "หมวด", "ราคาต่ำสุด", "ราคาสูงสุด", "สร้างเมื่อ"],
      rows: technicianServiceRows,
    },
    {
      key: "jobs",
      title: "งานซ่อม",
      tableName: "jobs",
      description: "งานที่ลูกค้าเปิดและสถานะการดำเนินงาน",
      total: jobsTotal,
      columns: ["ID", "งาน", "ลูกค้า", "ช่าง", "หมวด", "สถานะ", "สร้างเมื่อ"],
      rows: jobRows,
    },
    {
      key: "job_requests",
      title: "คำขอถึงช่าง",
      tableName: "job_requests",
      description: "คำขอและราคาเสนอจากช่างในแต่ละงาน",
      total: jobRequestsTotal,
      columns: ["ID", "งาน", "ช่าง", "สถานะ", "ราคาเสนอ", "สร้างเมื่อ"],
      rows: jobRequestRows,
    },
    {
      key: "chat_rooms",
      title: "ห้องแชต",
      tableName: "chat_rooms",
      description: "ห้องสนทนาของลูกค้ากับช่างต่อหนึ่งงาน",
      total: chatRoomsTotal,
      columns: ["ID", "งาน", "ลูกค้า", "ช่าง", "สร้างเมื่อ"],
      rows: chatRoomRows,
    },
    {
      key: "chat_messages",
      title: "ข้อความแชต",
      tableName: "chat_messages",
      description: "ข้อความในห้องสนทนาและสถานะการอ่าน",
      total: chatMessagesTotal,
      columns: ["ID", "งาน", "ผู้ส่ง", "ข้อความ", "อ่าน", "ส่งเมื่อ"],
      rows: chatMessageRows,
    },
    {
      key: "reviews",
      title: "รีวิว",
      tableName: "reviews",
      description: "คะแนนและความคิดเห็นหลังจบงาน",
      total: reviewsTotal,
      columns: ["ID", "งาน", "ลูกค้า", "ช่าง", "คะแนน", "รีวิว", "สร้างเมื่อ"],
      rows: reviewRows,
    },
    {
      key: "notifications",
      title: "การแจ้งเตือน",
      tableName: "notifications",
      description: "ข้อความแจ้งเตือนของผู้ใช้ในระบบ",
      total: notificationsTotal,
      columns: ["ID", "ผู้ใช้", "หัวข้อ", "ข้อความ", "อ่าน", "สร้างเมื่อ"],
      rows: notificationRows,
    },
  ];
}
