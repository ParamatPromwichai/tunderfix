import { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export async function getUnreadMessagesCount(userId: string): Promise<number> {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(cm.id) as unreadCount 
     FROM chat_messages cm
     JOIN chat_rooms cr ON cm.room_id = cr.id
     WHERE cm.is_read = FALSE
     AND cm.sender_id != ?
     AND (cr.customer_id = ? OR cr.technician_id = ?)`,
    [userId, userId, userId]
  );
  return parseInt(rows[0].unreadCount, 10) || 0;
}

export async function getPendingRequestsCount(technicianId: string): Promise<number> {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(id) as pendingCount 
     FROM job_requests 
     WHERE technician_id = ? AND status = 'pending'`,
    [technicianId]
  );
  return parseInt(rows[0].pendingCount, 10) || 0;
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(id) as unreadCount 
     FROM notifications 
     WHERE user_id = ? AND is_read = FALSE`,
    [userId]
  );
  return parseInt(rows[0].unreadCount, 10) || 0;
}
