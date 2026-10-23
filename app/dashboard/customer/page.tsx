import Link from "next/link";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getActiveUserById } from "@/services/auth.service";
import { getCustomerJobs } from "@/services/jobs.service";
import { getUserNotifications } from "@/services/notifications.service";
import { Card, ChevronLink, EmptyState, Meta, MetaRow, SectionTitle, StatCard, StatusBadge, btnAmber, btnPrimary } from "@/components/ui/minimal";

export const dynamic = "force-dynamic";

const customerLabels: Record<string, string> = {
  requested: "รอช่างตอบรับ",
  accepted: "รับงานแล้ว",
};

export default async function CustomerDashboard() {
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) return null;

  const currentUser = await getActiveUserById(tokenUser.userId);
  const jobs = await getCustomerJobs(tokenUser.userId);
  const notifications = await getUserNotifications(tokenUser.userId);

  const activeJobs = jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled');
  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Greeting */}
      <header className="flex items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="text-xs text-stone-500">สวัสดี 👋</p>
          <h1 className="truncate text-xl font-black text-stone-900">คุณ{currentUser?.fullName?.split(' ')[0]}</h1>
        </div>
        <Link href="/dashboard/customer/explore" className={btnAmber}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          ค้นหาช่าง
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="กำลังดำเนินการ" value={activeJobs.length} />
        <StatCard label="งานทั้งหมด" value={jobs.length} />
        <StatCard label="แจ้งเตือนใหม่" value={unreadNotifs} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active jobs */}
        <section className="space-y-3 lg:col-span-2">
          <SectionTitle action={<ChevronLink href="/dashboard/customer/jobs">ทั้งหมด</ChevronLink>}>งานที่กำลังดำเนินการ</SectionTitle>
          {activeJobs.length > 0 ? (
            <div className="space-y-3">
              {activeJobs.map(job => (
                <Link key={job.id} href={`/dashboard/customer/jobs/${job.id}`} className="block">
                  <Card hover className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="truncate text-[15px] font-bold text-stone-900">{job.title}</h3>
                      <StatusBadge status={job.status} label={customerLabels[job.status]} />
                    </div>
                    {job.description && <p className="mt-1.5 line-clamp-1 text-sm text-stone-600">{job.description}</p>}
                    <div className="mt-3 border-t border-stone-100 pt-3">
                      <MetaRow><Meta icon="calendar">สร้างเมื่อ {new Date(job.createdAt).toLocaleDateString('th-TH')}</Meta></MetaRow>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
              title="ยังไม่มีงานซ่อมที่กำลังดำเนินการ"
              description="โพสต์งานเพื่อให้ช่างเสนอราคาได้เลย"
              action={<Link href="/dashboard/customer/jobs/new" className={btnPrimary}>โพสต์หาช่าง</Link>}
            />
          )}
        </section>

        {/* Notifications */}
        <section className="space-y-3">
          <SectionTitle>การแจ้งเตือน</SectionTitle>
          {notifications.length > 0 ? (
            <Card className="divide-y divide-stone-100 overflow-hidden">
              {notifications.slice(0, 5).map(notif => (
                <div key={notif.id} className="flex gap-3 p-4">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!notif.isRead ? 'bg-amber-500' : 'bg-stone-200'}`} />
                  <div className="min-w-0">
                    <p className={`text-sm ${!notif.isRead ? 'font-bold text-stone-900' : 'font-medium text-stone-600'}`}>{notif.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-stone-500">{notif.message}</p>
                    <p className="mt-1.5 text-[11px] text-stone-400">{new Date(notif.createdAt).toLocaleString('th-TH')}</p>
                  </div>
                </div>
              ))}
            </Card>
          ) : (
            <EmptyState
              icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
              title="ยังไม่มีการแจ้งเตือน"
            />
          )}
        </section>
      </div>
    </div>
  );
}
