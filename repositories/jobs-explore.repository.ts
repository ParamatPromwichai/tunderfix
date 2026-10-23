// Force turbopack rebuild
import { type RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { Job } from "./jobs.repository";

// To avoid duplicating mapRow, we could reuse it, but here we redefine a simple one for open jobs
type JobRow = RowDataPacket & {
  id: string;
  customer_id: string;
  category_id: string;
  technician_id: string | null;
  title: string;
  description: string;
  address_text: string;
  latitude: string;
  longitude: string;
  budget_min: string | null;
  budget_max: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: any;
  final_price: string | null; // เพิ่มฟิลด์นี้เพื่อให้รองรับข้อมูลจาก Database
  created_at: string;
  updated_at: string;
};

export async function getOpenJobs(technicianId: string): Promise<Job[]> {
  // Get jobs that are 'requested' and the technician HAS NOT sent a request yet
  const [rows] = await db.execute<JobRow[]>(
    `SELECT j.* 
     FROM jobs j
     LEFT JOIN job_requests jr ON j.id = jr.job_id AND jr.technician_id = ?
     WHERE j.status = 'requested' AND j.technician_id IS NULL AND jr.id IS NULL
       AND NOT EXISTS (SELECT 1 FROM urgent_dispatch d WHERE d.job_id = j.id)
     ORDER BY j.created_at DESC
     LIMIT 50`,
    [technicianId]
  );
  
  return rows.map(row => ({
    id: String(row.id),
    customerId: String(row.customer_id),
    categoryId: String(row.category_id),
    technicianId: row.technician_id ? String(row.technician_id) : null,
    title: row.title,
    description: row.description,
    addressText: row.address_text,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    budgetMin: row.budget_min ? parseFloat(row.budget_min) : null,
    budgetMax: row.budget_max ? parseFloat(row.budget_max) : null,
    preferredDate: row.preferred_date ? String(row.preferred_date) : null,
    preferredTime: row.preferred_time ? String(row.preferred_time) : null,
    status: row.status,
    finalPrice: row.final_price ? parseFloat(row.final_price) : null, // แมปค่าตรงนี้ให้ตรงกับ Interface Job
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getDirectRequests(technicianId: string): Promise<Job[]> {
  // Get jobs that are 'requested' and specifically assigned to this technician,
  // and the technician HAS NOT sent a request/offer yet
  const [rows] = await db.execute<JobRow[]>(
    `SELECT j.* 
     FROM jobs j
     LEFT JOIN job_requests jr ON j.id = jr.job_id AND jr.technician_id = ?
     WHERE j.status = 'requested' AND j.technician_id = ? AND jr.id IS NULL
     ORDER BY j.created_at DESC`,
    [technicianId, technicianId]
  );
  
  return rows.map(row => ({
    id: String(row.id),
    customerId: String(row.customer_id),
    categoryId: String(row.category_id),
    technicianId: row.technician_id ? String(row.technician_id) : null,
    title: row.title,
    description: row.description,
    addressText: row.address_text,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    budgetMin: row.budget_min ? parseFloat(row.budget_min) : null,
    budgetMax: row.budget_max ? parseFloat(row.budget_max) : null,
    preferredDate: row.preferred_date ? String(row.preferred_date) : null,
    preferredTime: row.preferred_time ? String(row.preferred_time) : null,
    status: row.status,
    finalPrice: row.final_price ? parseFloat(row.final_price) : null, // แมปค่าตรงนี้ให้ตรงกับ Interface Job
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
