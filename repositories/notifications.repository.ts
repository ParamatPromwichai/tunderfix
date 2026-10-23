import { executeInsert } from "@/lib/database-insert";
import { type ResultSetHeader, type RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  relatedJobId: string | null;
  isRead: boolean;
  createdAt: string;
}

type NotificationRow = RowDataPacket & {
  id: string;
  user_id: string;
  title: string;
  message: string;
  related_job_id: string | null;
  is_read: boolean;
  created_at: string;
};

export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  relatedJobId?: string;
}): Promise<string> {
  const [result] = await executeInsert(
    db,
    `INSERT INTO notifications (user_id, title, message, related_job_id)
     VALUES (?, ?, ?, ?)`,
    [input.userId, input.title, input.message, input.relatedJobId ?? null],
  );
  return String(result.insertId);
}

export async function getNotificationsByUser(
  userId: string,
): Promise<Notification[]> {
  const [rows] = await db.execute<NotificationRow[]>(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    title: r.title,
    message: r.message,
    relatedJobId: r.related_job_id ? String(r.related_job_id) : null,
    isRead: Boolean(r.is_read),
    createdAt: r.created_at,
  }));
}

export async function markAsRead(id: string, userId: string): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
    [id, userId],
  );
  return result.affectedRows > 0;
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`,
    [userId],
  );
  return result.affectedRows > 0;
}
