import Link from "next/link";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getOpenJobsForTechnician } from "@/services/jobs-explore.service";
import { Card, EmptyState, Meta, MetaRow, PageHeader, StatusBadge, btnPrimary, formatBudget } from "@/components/ui/minimal";

export const dynamic = "force-dynamic";

export default async function TechnicianExplorePage() {
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) return null;

  const openJobs = await getOpenJobsForTechnician(tokenUser.userId);

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-24 animate-in fade-in duration-300">
      <PageHeader
        title="ตลาดงาน"
        subtitle={<>งานใหม่ที่รอช่างเสนอราคา <span className="font-bold text-amber-600">{openJobs.length}</span> งาน</>}
      />

      {openJobs.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {openJobs.map((job, index) => (
            <Card
              key={job.id}
              hover
              className="flex flex-col p-4 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="truncate text-[15px] font-bold text-stone-900">{job.title}</h2>
                <StatusBadge status="open" />
              </div>
              {job.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">{job.description}</p>
              )}
              <div className="mt-2.5">
                <MetaRow>
                  <Meta icon="pin">{job.addressText}</Meta>
                  <Meta icon="calendar">{new Date(job.createdAt).toLocaleDateString('th-TH')}</Meta>
                </MetaRow>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
                <div className="min-w-0">
                  <p className="text-xs text-stone-400">งบประมาณ</p>
                  <p className="truncate text-[15px] font-bold tabular-nums text-stone-900">{formatBudget(job.budgetMin, job.budgetMax)}</p>
                </div>
                <Link href={`/dashboard/technician/jobs/${job.id}`} className={btnPrimary}>เสนอราคา</Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
          title="ไม่มีงานใหม่ในขณะนี้"
          description="โปรดกลับมาตรวจสอบอีกครั้งในภายหลัง"
        />
      )}
    </div>
  );
}
