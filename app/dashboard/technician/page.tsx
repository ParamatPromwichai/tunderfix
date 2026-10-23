import Link from "next/link";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getActiveUserById } from "@/services/auth.service";
import { getTechnicianJobs } from "@/services/jobs.service";
import { getTechnicianRequests } from "@/services/job-requests.service";
import { getTechnicianReviews } from "@/services/reviews.service";
import { Card, EmptyState, Meta, MetaRow, SectionTitle, StatCard, StatusBadge, ChevronLink, btnPrimary } from "@/components/ui/minimal";

export const dynamic = "force-dynamic";

export default async function TechnicianDashboard() {
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) return null;

  const currentUser = await getActiveUserById(tokenUser.userId);
  const jobs = await getTechnicianJobs(tokenUser.userId);
  const requests = await getTechnicianRequests(tokenUser.userId);
  const reviews = await getTechnicianReviews(tokenUser.userId);

  const activeJobs = jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled');
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'ใหม่';

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Greeting */}
      <header className="flex items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="text-xs text-stone-500">สวัสดี 👋</p>
          <h1 className="truncate text-xl font-black text-stone-900">ช่าง{currentUser?.fullName?.split(' ')[0]}</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 ring-1 ring-stone-200/70">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          เปิดรับงาน
        </span>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="กำลังทำ" value={activeJobs.length} />
        <StatCard label="รอลูกค้าตอบรับ" value={pendingRequests.length} />
        <StatCard label="สำเร็จแล้ว" value={jobs.filter(j => j.status === 'completed').length} />
        <StatCard label="คะแนนรีวิว" value={<>{avgRating}<span className="ml-1 text-xs font-medium text-stone-400">/5</span></>} hint={`${reviews.length} รีวิว`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active jobs */}
        <section className="space-y-3">
          <SectionTitle action={<ChevronLink href="/dashboard/technician/jobs">ทั้งหมด</ChevronLink>}>งานที่ต้องดำเนินการ</SectionTitle>
          {activeJobs.length > 0 ? (
            <div className="space-y-3">
              {activeJobs.map(job => (
                <Card key={job.id} hover className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate text-[15px] font-bold text-stone-900">{job.title}</h3>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="mt-1.5">
                    <MetaRow><Meta icon="pin">{job.addressText}</Meta></MetaRow>
                  </div>
                  <div className="mt-3 border-t border-stone-100 pt-3">
                    <Link href={`/dashboard/technician/jobs/${job.id}`} className={`${btnPrimary} w-full`}>จัดการงาน</Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
              title="ไม่มีงานที่กำลังดำเนินการ"
            />
          )}
        </section>

        {/* Pending requests */}
        <section className="space-y-3">
          <SectionTitle>รอการตอบรับจากลูกค้า</SectionTitle>
          {pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <Card key={req.id} hover className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-bold text-stone-900">งานซ่อม #{req.jobId}</h3>
                    <StatusBadge status="pending" />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                    <div>
                      <p className="text-xs text-stone-400">ราคาที่เสนอ</p>
                      <p className="text-[15px] font-bold tabular-nums text-stone-900">
                        {req.quotedPrice ? `฿${Number(req.quotedPrice).toLocaleString()}` : 'ประเมินหน้างาน'}
                      </p>
                    </div>
                    <ChevronLink href={`/dashboard/technician/jobs/${req.jobId}`}>ดูรายละเอียด</ChevronLink>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              title="ไม่มีคำขอที่รอลูกค้าตอบรับ"
            />
          )}
        </section>
      </div>
    </div>
  );
}
