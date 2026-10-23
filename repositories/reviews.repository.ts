import { executeInsert } from "@/lib/database-insert";
import { type RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export interface Review {
  id: string;
  jobId: string;
  customerId: string;
  technicianId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

type ReviewRow = RowDataPacket & {
  id: string;
  job_id: string;
  customer_id: string;
  technician_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export async function createReview(input: {
  jobId: string;
  customerId: string;
  technicianId: string;
  rating: number;
  comment?: string;
}): Promise<string> {
  const [result] = await executeInsert(
    db,
    `INSERT INTO reviews (job_id, customer_id, technician_id, rating, comment)
     VALUES (?, ?, ?, ?, ?)`,
    [
      input.jobId,
      input.customerId,
      input.technicianId,
      input.rating,
      input.comment ?? null,
    ],
  );

  // Update technician profile average rating
  await db.execute(
    `UPDATE technician_profiles 
     SET total_reviews = total_reviews + 1,
         average_rating = (
           SELECT AVG(rating) FROM reviews WHERE technician_id = ?
         )
     WHERE user_id = ?`,
    [input.technicianId, input.technicianId],
  );

  return String(result.insertId);
}

export async function getReviewsByTechnician(
  technicianId: string,
): Promise<Review[]> {
  const [rows] = await db.execute<ReviewRow[]>(
    `SELECT * FROM reviews WHERE technician_id = ? ORDER BY created_at DESC`,
    [technicianId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    jobId: String(r.job_id),
    customerId: String(r.customer_id),
    technicianId: String(r.technician_id),
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  }));
}

export async function getReviewByJob(jobId: string): Promise<Review | null> {
  const [rows] = await db.execute<ReviewRow[]>(
    `SELECT * FROM reviews WHERE job_id = ?`,
    [jobId],
  );
  if (!rows[0]) return null;
  return {
    id: String(rows[0].id),
    jobId: String(rows[0].job_id),
    customerId: String(rows[0].customer_id),
    technicianId: String(rows[0].technician_id),
    rating: rows[0].rating,
    comment: rows[0].comment,
    createdAt: rows[0].created_at,
  };
}
