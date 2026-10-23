import { type ResultSetHeader, type RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export type JobStatus = 'requested' | 'accepted' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  customerId: string;
  categoryId: string;
  technicianId: string | null;
  title: string;
  description: string;
  addressText: string;
  latitude: number;
  longitude: number;
  budgetMin: number | null;
  budgetMax: number | null;
  finalPrice: number | null;
  preferredDate: string | null;
  preferredTime: string | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

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
  final_price: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
};

function mapRow(row: JobRow): Job {
  return {
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
    finalPrice: row.final_price ? parseFloat(row.final_price) : null,
    preferredDate: row.preferred_date ? String(row.preferred_date) : null,
    preferredTime: row.preferred_time ? String(row.preferred_time) : null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createJob(input: {
  customerId: string;
  categoryId: string;
  title: string;
  description: string;
  addressText: string;
  latitude: number;
  longitude: number;
  technicianId?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredDate?: string;
  preferredTime?: string;
}): Promise<string> {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO jobs (
      customer_id, category_id, technician_id, title, description, address_text, 
      latitude, longitude, budget_min, budget_max, preferred_date, preferred_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.customerId, input.categoryId, input.technicianId ?? null, input.title, input.description, input.addressText,
      input.latitude, input.longitude, input.budgetMin ?? null, input.budgetMax ?? null, 
      input.preferredDate ?? null, input.preferredTime ?? null
    ]
  );
  return String(result.insertId);
}

export async function getJobById(id: string): Promise<Job | null> {
  const [rows] = await db.execute<JobRow[]>(
    `SELECT * FROM jobs WHERE id = ?`,
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE jobs SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows > 0;
}

export async function updateJobFinalPrice(id: string, finalPrice: number): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE jobs SET final_price = ? WHERE id = ?`,
    [finalPrice, id]
  );
  return result.affectedRows > 0;
}

export async function assignTechnician(id: string, technicianId: string): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE jobs SET technician_id = ?, status = 'accepted' WHERE id = ?`,
    [technicianId, id]
  );
  return result.affectedRows > 0;
}

export async function getJobsByCustomer(customerId: string): Promise<Job[]> {
  const [rows] = await db.execute<JobRow[]>(
    `SELECT * FROM jobs WHERE customer_id = ? ORDER BY created_at DESC`,
    [customerId]
  );
  return rows.map(mapRow);
}

export async function getJobsByTechnician(technicianId: string): Promise<Job[]> {
  const [rows] = await db.execute<JobRow[]>(
    `SELECT * FROM jobs WHERE technician_id = ? ORDER BY created_at DESC`,
    [technicianId]
  );
  return rows.map(mapRow);
}
