import * as notificationsRepo from "@/repositories/notifications.repository";
import * as chatRepo from "@/repositories/chat.repository";
import { getJobById } from "@/repositories/jobs.repository";
import { ForbiddenError } from "@/lib/auth";

export async function getOrCreateRoom(
  jobId: string,
  customerId: string,
  technicianId: string,
) {
  const job = await getJobById(jobId);
  if (
    !job ||
    job.customerId !== customerId ||
    job.technicianId !== technicianId
  ) {
    throw new Error("ไม่สามารถเปิดห้องแชตของงานนี้ได้");
  }
  return await chatRepo.createChatRoom(jobId, customerId, technicianId);
}

export async function getUserChatRooms(
  userId: string,
  role: "customer" | "technician",
) {
  return await chatRepo.getChatRoomsByUser(userId, role);
}

export async function sendMessage(
  roomId: string,
  senderId: string,
  message: string,
  attachmentUrl?: string,
) {
  const room = await chatRepo.getRoomById(roomId);
  if (!room || (room.customerId !== senderId && room.technicianId !== senderId))
    throw new ForbiddenError("คุณไม่ได้อยู่ในห้องแชตนี้");
  if (typeof message !== "string" || !message.trim() || message.length > 5000)
    throw new RangeError("กรุณากรอกข้อความไม่เกิน 5,000 ตัวอักษร");
  const messageId = await chatRepo.addMessage(
    roomId,
    senderId,
    message,
    attachmentUrl,
  );

  // Find recipient and send notification
  if (room) {
    const recipientId =
      room.customerId === senderId ? room.technicianId : room.customerId;

    // Check if we need to send a notification (in a real app, maybe only if offline or not in room)
    // For now, always create a notification in DB
    await notificationsRepo.createNotification({
      userId: recipientId,
      title: "ข้อความใหม่",
      message: `คุณมีข้อความใหม่: ${message.substring(0, 50)}${message.length > 50 ? "..." : ""}`,
      relatedJobId: room.jobId,
    });
  }

  return messageId;
}

export async function getRoomMessages(roomId: string) {
  return await chatRepo.getMessagesByRoom(roomId);
}

export async function getRoomLatestMessage(roomId: string) {
  return await chatRepo.getLatestMessage(roomId);
}

export async function getRoomUnreadCount(roomId: string, userId: string) {
  return await chatRepo.getUnreadCount(roomId, userId);
}

export async function readMessages(roomId: string, userId: string) {
  return await chatRepo.markMessagesAsRead(roomId, userId);
}
