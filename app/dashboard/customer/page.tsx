import Link from "next/link";
import {
  Search,
  Plus,
  BriefcaseBusiness,
  UserRound,
  ArrowUpRight,
  Wrench,
} from "lucide-react";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getActiveUserById } from "@/services/auth.service";
import { getCustomerJobs } from "@/services/jobs.service";
import { getUserNotifications } from "@/services/notifications.service";
import { DispatchOverview } from "@/components/DispatchOverview";
import { StatusBadge } from "@/components/ui/minimal";
import { OverviewPanels } from "@/components/OverviewPanels";
export const dynamic = "force-dynamic";
export default async function Page() {
  const token = await getAuthUserFromCookies();
  if (!token) return null;
  const [user, jobs, notifications] = await Promise.all([
    getActiveUserById(token.userId),
    getCustomerJobs(token.userId),
    getUserNotifications(token.userId),
  ]);
  const active = jobs.filter(
    (j) => j.status !== "completed" && j.status !== "cancelled",
  );
  const base = "/dashboard/customer";
  return (
    <div className="dashboard-overview customer-overview">
      <header className="page-heading">
        <div>
          <p className="eyebrow">YOUR HOME, TAKEN CARE OF.</p>
          <h1>สวัสดี คุณ{user?.fullName.split(" ")[0]}</h1>
          <p>วันนี้มีเรื่องไหน ให้ช่างช่วยดูแล?</p>
        </div>
        <span className="outline-label">พื้นที่สำหรับลูกค้า</span>
      </header>
      <DispatchOverview role="customer" />
      <div className="quick-actions">
        {[
          {
            name: "ค้นหาช่าง",
            mobileName: "ค้นหาช่าง",
            path: "explore",
            icon: Search,
          },
          {
            name: "ลงประกาศนัดหมาย",
            mobileName: "ลงประกาศ",
            path: "jobs/new",
            icon: Plus,
          },
          {
            name: "งานซ่อมของฉัน",
            mobileName: "งานของฉัน",
            path: "jobs",
            icon: BriefcaseBusiness,
          },
          {
            name: "ที่อยู่และโปรไฟล์",
            mobileName: "โปรไฟล์",
            path: "profile",
            icon: UserRound,
          },
        ].map((a) => (
          <Link key={a.path} href={`${base}/${a.path}`} aria-label={a.name}>
            <span>
              <a.icon size={17} />
            </span>
            <strong className="mobile-full-label">{a.name}</strong>
            <strong className="mobile-short-label">{a.mobileName}</strong>
            <ArrowUpRight size={15} />
          </Link>
        ))}
      </div>
      <div className="metric-strip">
        <div>
          <small>งานที่กำลังดำเนินการ</small>
          <strong>
            {active.length}
            <span className="metric-unit">งาน</span>
          </strong>
        </div>
        <div>
          <small>รอช่างตอบกลับ</small>
          <strong>
            {jobs.filter((j) => j.status === "requested").length}
            <span className="metric-unit">งาน</span>
          </strong>
        </div>
        <div>
          <small>ดูแลเสร็จแล้ว</small>
          <strong>
            {jobs.filter((j) => j.status === "completed").length}
            <span className="metric-unit">งาน</span>
          </strong>
        </div>
        <div>
          <small>การแจ้งเตือนใหม่</small>
          <strong>
            {notifications.filter((n) => !n.isRead).length}
            <span className="metric-unit">รายการ</span>
          </strong>
        </div>
      </div>
      <OverviewPanels>
        <section>
          <div className="overview-section-title">
            <h2>งานที่กำลังดำเนินการ</h2>
            <Link
              className="text-link mobile-icon-action"
              aria-label="ดูงานทั้งหมด"
              title="ดูงานทั้งหมด"
              href={`${base}/jobs`}
            >
              <span className="mobile-command-label">ดูทั้งหมด</span>{" "}
              <ArrowUpRight size={15} />
            </Link>
          </div>
          {active.length ? (
            active.map((j) => (
              <Link
                className="job-row"
                key={j.id}
                href={`${base}/jobs/${j.id}`}
              >
                <div className="job-row-heading">
                  <h3>{j.title}</h3>
                  <StatusBadge status={j.status} />
                </div>
                <p className="line-clamp-2">{j.description}</p>
                <p>{j.addressText}</p>
              </Link>
            ))
          ) : (
            <div className="empty-panel">
              <Wrench size={32} />
              <h3>ทุกอย่างเรียบร้อยดี</h3>
              <p>
                เมื่อมีงานซ่อมที่ต้องดูแล
                <br />
                คุณจะติดตามสถานะงานได้ตรงนี้
              </p>
              <Link className="button secondary" href={`${base}/explore`}>
                ค้นหาช่างสำหรับงานถัดไป <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </section>
        <section>
          <div className="overview-section-title">
            <h2>ความเคลื่อนไหวล่าสุด</h2>
            <span className="eyebrow orange">UPDATES</span>
          </div>
          {notifications.length ? (
            notifications.slice(0, 6).map((n) => (
              <Link
                key={n.id}
                href={
                  n.title.includes("งานด่วน")
                    ? `${base}/urgent`
                    : n.relatedJobId
                      ? `${base}/jobs/${n.relatedJobId}`
                      : `${base}/jobs`
                }
                className={`notification-row ${!n.isRead ? "unread" : ""}`}
              >
                <span />
                <div>
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <time>
                    {new Date(n.createdAt).toLocaleString("th-TH", {
                      timeZone: "Asia/Bangkok",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-panel">
              <p>
                ยังไม่มีการแจ้งเตือนใหม่
                <br />
                ความเคลื่อนไหวของงานจะปรากฏที่นี่
              </p>
            </div>
          )}
        </section>
      </OverviewPanels>
    </div>
  );
}
