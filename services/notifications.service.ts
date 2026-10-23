import * as notificationsRepo from "@/repositories/notifications.repository";

export async function sendNotification(input: {
  userId: string;
  title: string;
  message: string;
  relatedJobId?: string;
}) {
  return await notificationsRepo.createNotification(input);
}

export async function getUserNotifications(userId: string) {
  return await notificationsRepo.getNotificationsByUser(userId);
}

export async function markNotificationRead(id: string, userId: string) {
  return await notificationsRepo.markAsRead(id, userId);
}

export async function markAllNotificationsRead(userId: string) {
  return await notificationsRepo.markAllAsRead(userId);
}
