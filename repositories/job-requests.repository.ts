import { type ResultSetHeader, type RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export type JobRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface JobRequest {
  id: string;
  jobId: string;
  technicianId: string;
  status: JobRequestStatus;
  message: string | null;
  quotedPrice: number | null;
  respondedAt: string | null;
  createdAt: string;
}

type JobRequestRow = RowDataPacket & {
  id: string;
  job_id: string;
  technician_id: string;
  status: JobRequestStatus;
  message: string | null;
  quoted_price: string | null;
  responded_at: string | null;
  created_at: string;
};

function mapRow(row: JobRequestRow): JobRequest {
  return {
    id: String(row.id),
    jobId: String(row.job_id),
    technicianId: String(row.technician_id),
    status: row.status,
    message: row.message,
    quotedPrice: row.quoted_price ? parseFloat(row.quoted_price) : null,
    respondedAt: row.responded_at,
    createdAt: row.created_at,
  };
}

export async function createJobRequest(input: {
  jobId: string;
  technicianId: string;
  message?: string;
  quotedPrice?: number;
}): Promise<string> {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO job_requests (job_id, technician_id, message, quoted_price)
     VALUES (?, ?, ?, ?)`,
    [input.jobId, input.technicianId, input.message ?? null, input.quotedPrice ?? null]
  );
  return String(result.insertId);
}

export async function getRequestsByJob(jobId: string): Promise<JobRequest[]> {
  const [rows] = await db.execute<JobRequestRow[]>(
    `SELECT * FROM job_requests WHERE job_id = ? ORDER BY created_at DESC`,
    [jobId]
  );
  return rows.map(mapRow);
}

export async function getRequestsByTechnician(technicianId: string): Promise<JobRequest[]> {
  const [rows] = await db.execute<JobRequestRow[]>(
    `SELECT * FROM job_requests WHERE technician_id = ? ORDER BY created_at DESC`,
    [technicianId]
  );
  return rows.map(mapRow);
}

export async function updateRequestStatus(
  id: string, 
  status: JobRequestStatus, 
  respondedAt: boolean = false
): Promise<boolean> {
  const dateClause = respondedAt ? ", responded_at = NOW()" : "";
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE job_requests SET status = ? ${dateClause} WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows > 0;
}
