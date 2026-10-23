import { getUnreadMessagesCount, getPendingRequestsCount, getUnreadNotificationsCount } from "@/repositories/badges.repository";

export async function getNavBadges(userId: string, role: string) {
  const unreadMessages = await getUnreadMessagesCount(userId);
  const unreadNotifications = await getUnreadNotificationsCount(userId);
  
  let pendingRequests = 0;
  if (role === "technician") {
    pendingRequests = await getPendingRequestsCount(userId);
  }

  return {
    unreadMessages,
    unreadNotifications,
    pendingRequests,
  };
}
