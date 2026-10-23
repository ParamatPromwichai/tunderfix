import Link from "next/link";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getTechnicianJobs } from "@/services/jobs.service";
import { Card, EmptyState, Meta, MetaRow, PageHeader, StatusBadge } from "@/components/ui/minimal";

export const dynamic = "force-dynamic";

export default async function TechnicianJobsPage() {
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) return null;

  const jobs = await getTechnicianJobs(tokenUser.userId);

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-24 animate-in fade-in duration-300">
      <PageHeader
        title="งานของฉัน"
        subtitle={<>ทั้งหมด <span className="font-bold text-amber-600">{jobs.length}</span> งาน</>}
      />

      {jobs.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {jobs.map((job, index) => (
            <Link
              key={job.id}
              href={`/dashboard/technician/jobs/${job.id}`}
              className="block animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
            >
              <Card hover className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate text-[15px] font-bold text-stone-900">{job.title}</h3>
                  <StatusBadge status={job.status} />
                </div>
                <div className="mt-1.5">
                  <MetaRow><Meta icon="pin">{job.addressText}</Meta></MetaRow>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                  <span className="text-stone-400">รับงานเมื่อ {new Date(job.createdAt).toLocaleDateString('th-TH')}</span>
                  <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600">
                    รายละเอียด
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          title="ยังไม่มีงานที่คุณรับผิดชอบ"
          description="เมื่องานได้รับการอนุมัติ จะมาแสดงที่นี่"
        />
      )}
    </div>
  );
}
