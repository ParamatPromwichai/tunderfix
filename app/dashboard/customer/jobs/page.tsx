import Link from "next/link";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getCustomerJobs } from "@/services/jobs.service";
import { JobFilters } from "@/components/JobFilters";
import {
  Card,
  EmptyState,
  Meta,
  MetaRow,
  PageHeader,
  StatusBadge,
  btnPrimary,
} from "@/components/ui/minimal";

export const dynamic = "force-dynamic";

const customerLabels: Record<string, string> = {
  requested: "รอช่างตอบรับ",
  accepted: "รับงานแล้ว",
};

export default async function CustomerJobsPage() {
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) return null;

  const jobs = await getCustomerJobs(tokenUser.userId);

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-24 animate-in fade-in duration-300">
      <PageHeader
        title="งานซ่อมของฉัน"
        subtitle={
          <>
            ทั้งหมด{" "}
            <span className="font-bold text-amber-600">{jobs.length}</span> งาน
          </>
        }
        action={
          <Link
            href="/dashboard/customer/jobs/new"
            aria-label="โพสต์หาช่างใหม่"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-stone-950 shadow-sm transition hover:bg-amber-300 active:scale-90"
          >
            <svg
              className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M12 5v14m7-7H5"
              />
            </svg>
          </Link>
        }
      />

      {jobs.length > 0 ? (
        <JobFilters
          jobs={jobs.map(({ id, title, status }) => ({ id, title, status }))}
        >
          {jobs.map((job, index) => (
            <Link
              key={job.id}
              href={`/dashboard/customer/jobs/${job.id}`}
              className="block animate-in fade-in slide-in-from-bottom-2"
              style={{
                animationDelay: `${index * 40}ms`,
                animationFillMode: "both",
              }}
            >
              <Card hover className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate text-[15px] font-bold text-stone-900">
                    {job.title}
                  </h3>
                  <StatusBadge
                    status={job.status}
                    label={customerLabels[job.status]}
                  />
                </div>
                {job.description && (
                  <p className="mt-1.5 line-clamp-1 text-sm text-stone-600">
                    {job.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                  <MetaRow>
                    <Meta icon="calendar">
                      แจ้งเมื่อ{" "}
                      {new Date(job.createdAt).toLocaleDateString("th-TH")}
                    </Meta>
                  </MetaRow>
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600">
                    รายละเอียด
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </JobFilters>
      ) : (
        <EmptyState
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
          title="คุณยังไม่เคยแจ้งซ่อม"
          description="เริ่มสร้างงานซ่อมแรกของคุณได้เลย"
          action={
            <Link href="/dashboard/customer/jobs/new" className={btnPrimary}>
              โพสต์หาช่าง
            </Link>
          }
        />
      )}
    </div>
  );
}
