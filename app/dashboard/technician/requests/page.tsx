import Link from "next/link";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getDirectRequestsForTechnician } from "@/services/jobs-explore.service";
import { Card, EmptyState, Meta, MetaRow, PageHeader, btnPrimary, formatBudget } from "@/components/ui/minimal";

export const dynamic = "force-dynamic";

export default async function TechnicianRequestsPage() {
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) return null;

  const directRequests = await getDirectRequestsForTechnician(tokenUser.userId);

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-24 animate-in fade-in duration-300">
      <PageHeader
        title="คำขอถึงคุณโดยตรง"
        subtitle="งานที่ลูกค้าเจาะจงเลือกคุณ"
      />

      {directRequests.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {directRequests.map(job => (
            <Card key={job.id} hover className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="truncate text-[15px] font-bold text-stone-900">{job.title}</h2>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  เลือกคุณ
                </span>
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
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          title="ไม่มีคำขอเจาะจงในขณะนี้"
          description="เมื่อลูกค้าระบุให้คุณเป็นช่าง จะมาแสดงที่นี่"
        />
      )}
    </div>
  );
}
