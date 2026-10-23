import { executeInsert } from "@/lib/database-insert";
import { type ResultSetHeader, type RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export interface ChatRoom {
  id: string;
  jobId: string;
  customerId: string;
  technicianId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  attachmentUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

type ChatRoomRow = RowDataPacket & {
  id: string;
  job_id: string;
  customer_id: string;
  technician_id: string;
  created_at: string;
};

type ChatMessageRow = RowDataPacket & {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
};

export async function createChatRoom(
  jobId: string,
  customerId: string,
  technicianId: string,
): Promise<string> {
  const [result] = await executeInsert(
    db,
    `INSERT IGNORE INTO chat_rooms (job_id, customer_id, technician_id)
     VALUES (?, ?, ?)`,
    [jobId, customerId, technicianId],
  );
  if (result.insertId) {
    return String(result.insertId);
  }
  // If exists, find and return it
  const [rows] = await db.execute<ChatRoomRow[]>(
    `SELECT id FROM chat_rooms WHERE job_id = ? AND customer_id = ? AND technician_id = ?`,
    [jobId, customerId, technicianId],
  );
  return String(rows[0].id);
}

export async function getChatRoomsByUser(
  userId: string,
  role: "customer" | "technician",
): Promise<ChatRoom[]> {
  const column = role === "customer" ? "customer_id" : "technician_id";
  const [rows] = await db.execute<ChatRoomRow[]>(
    `SELECT * FROM chat_rooms WHERE ${column} = ? ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    jobId: String(r.job_id),
    customerId: String(r.customer_id),
    technicianId: String(r.technician_id),
    createdAt: r.created_at,
  }));
}

export async function getRoomById(roomId: string): Promise<ChatRoom | null> {
  const [rows] = await db.execute<ChatRoomRow[]>(
    `SELECT * FROM chat_rooms WHERE id = ?`,
    [roomId],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: String(r.id),
    jobId: String(r.job_id),
    customerId: String(r.customer_id),
    technicianId: String(r.technician_id),
    createdAt: r.created_at,
  };
}

export async function addMessage(
  roomId: string,
  senderId: string,
  message: string,
  attachmentUrl?: string,
): Promise<string> {
  const [result] = await executeInsert(
    db,
    `INSERT INTO chat_messages (room_id, sender_id, message, attachment_url)
     VALUES (?, ?, ?, ?)`,
    [roomId, senderId, message, attachmentUrl ?? null],
  );
  return String(result.insertId);
}

export async function getMessagesByRoom(
  roomId: string,
): Promise<ChatMessage[]> {
  const [rows] = await db.execute<ChatMessageRow[]>(
    `SELECT * FROM chat_messages WHERE room_id = ? ORDER BY created_at ASC`,
    [roomId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    roomId: String(r.room_id),
    senderId: String(r.sender_id),
    message: r.message,
    attachmentUrl: r.attachment_url,
    isRead: Boolean(r.is_read),
    createdAt: r.created_at,
  }));
}

export async function getLatestMessage(
  roomId: string,
): Promise<ChatMessage | null> {
  const [rows] = await db.execute<ChatMessageRow[]>(
    `SELECT * FROM chat_messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 1`,
    [roomId],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: String(r.id),
    roomId: String(r.room_id),
    senderId: String(r.sender_id),
    message: r.message,
    attachmentUrl: r.attachment_url,
    isRead: Boolean(r.is_read),
    createdAt: r.created_at,
  };
}

export async function getUnreadCount(
  roomId: string,
  userId: string,
): Promise<number> {
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM chat_messages WHERE room_id = ? AND sender_id != ? AND is_read = FALSE`,
    [roomId, userId],
  );
  return Number(rows[0].count);
}

export async function markMessagesAsRead(
  roomId: string,
  userId: string,
): Promise<boolean> {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE chat_messages SET is_read = TRUE WHERE room_id = ? AND sender_id != ?`,
    [roomId, userId],
  );
  return result.affectedRows > 0;
}
