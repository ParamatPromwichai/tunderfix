import Link from "next/link";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getUserChatRooms, getRoomLatestMessage, getRoomUnreadCount } from "@/services/chat.service";
import { getJobDetails } from "@/services/jobs.service";
import { getActiveUserById } from "@/services/auth.service";
import { Card, EmptyState, PageHeader } from "@/components/ui/minimal";

export const dynamic = "force-dynamic";

export default async function TechnicianChatListPage() {
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) return null;

  const rooms = await getUserChatRooms(tokenUser.userId, 'technician');

  const roomDetails = await Promise.all(rooms.map(async room => {
    const job = await getJobDetails(room.jobId);
    const customer = await getActiveUserById(room.customerId);
    const latestMessage = await getRoomLatestMessage(room.id);
    const unreadCount = await getRoomUnreadCount(room.id, tokenUser.userId);
    return {
      ...room,
      jobTitle: job?.title || `งานซ่อม #${room.jobId}`,
      customerName: customer?.fullName || "ลูกค้า",
      latestMessage,
      unreadCount,
    };
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-24 animate-in fade-in duration-300">
      <PageHeader title="ข้อความ" subtitle="พูดคุยรายละเอียดงานกับลูกค้า" />

      {roomDetails.length > 0 ? (
        <Card className="divide-y divide-stone-100 overflow-hidden">
          {roomDetails.map(room => {
            const unread = room.unreadCount > 0;
            return (
              <Link
                key={room.id}
                href={`/dashboard/technician/chat/${room.id}`}
                className="flex items-center gap-3 p-4 transition hover:bg-stone-50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-base font-black text-amber-600 ring-1 ring-amber-100">
                  {room.customerName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className={`truncate text-[15px] ${unread ? 'font-bold text-stone-900' : 'font-semibold text-stone-800'}`}>
                      {room.customerName}
                    </h3>
                    <span className={`shrink-0 text-[11px] ${unread ? 'font-semibold text-amber-600' : 'text-stone-400'}`}>
                      {new Date(room.latestMessage?.createdAt ?? room.createdAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-stone-400">{room.jobTitle}</p>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className={`truncate text-sm ${unread ? 'font-medium text-stone-900' : 'text-stone-500'}`}>
                      {room.latestMessage
                        ? (room.latestMessage.senderId === tokenUser.userId ? `คุณ: ${room.latestMessage.message}` : room.latestMessage.message)
                        : "เริ่มการสนทนา..."}
                    </p>
                    {unread && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-stone-950">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </Card>
      ) : (
        <EmptyState
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
          title="ยังไม่มีห้องแชท"
          description="ห้องแชทจะปรากฏเมื่อมีการพูดคุยกับลูกค้า"
        />
      )}
    </div>
  );
}
