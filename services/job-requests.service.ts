import * as jobRequestsRepo from "@/repositories/job-requests.repository";
import * as jobsRepo from "@/repositories/jobs.repository";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function sendJobRequest(input: {
  jobId: string;
  technicianId: string;
  message?: string;
  quotedPrice?: number;
}) {
  return await jobRequestsRepo.createJobRequest(input);
}

export async function getJobRequests(jobId: string) {
  return await jobRequestsRepo.getRequestsByJob(jobId);
}

export async function getTechnicianRequests(technicianId: string) {
  return await jobRequestsRepo.getRequestsByTechnician(technicianId);
}

export async function acceptRequest(
  requestId: string,
  jobId: string,
  technicianId: string,
) {
  const c = await db.getConnection();
  try {
    await c.beginTransaction();
    const [jobs] = await c.execute<RowDataPacket[]>(
      `SELECT * FROM jobs WHERE id = ? FOR UPDATE`,
      [jobId],
    );
    const [urgent] = await c.execute<RowDataPacket[]>(
      `SELECT job_id FROM urgent_dispatch WHERE job_id = ?`,
      [jobId],
    );
    const [requests] = await c.execute<RowDataPacket[]>(
      `SELECT id FROM job_requests WHERE id = ? AND job_id = ? AND technician_id = ? AND status = 'pending'`,
      [requestId, jobId, technicianId],
    );
    if (
      !jobs[0] ||
      jobs[0].status !== "requested" ||
      (jobs[0].technician_id &&
        String(jobs[0].technician_id) !== technicianId) ||
      urgent.length ||
      !requests.length
    )
      throw new Error("ไม่สามารถยืนยันข้อเสนอนี้ได้");
    await c.execute(
      `UPDATE jobs SET technician_id = ?, status = 'accepted' WHERE id = ?`,
      [technicianId, jobId],
    );
    await c.execute(
      `UPDATE job_requests SET status = CASE WHEN id = ? THEN 'accepted' ELSE 'rejected' END, responded_at = NOW() WHERE job_id = ? AND status = 'pending'`,
      [requestId, jobId],
    );
    await c.commit();
    return true;
  } catch (error) {
    await c.rollback();
    throw error;
  } finally {
    c.release();
  }
}

export async function rejectRequest(requestId: string) {
  return await jobRequestsRepo.updateRequestStatus(requestId, "rejected", true);
}
