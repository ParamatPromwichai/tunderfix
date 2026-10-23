import Link from "next/link";
import {
  Search,
  Wrench,
  MapPin,
  MessageSquare,
  ArrowUpRight,
  BriefcaseBusiness,
} from "lucide-react";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getActiveUserById } from "@/services/auth.service";
import { getTechnicianJobs } from "@/services/jobs.service";
import { getTechnicianRequests } from "@/services/job-requests.service";
import { getTechnicianReviews } from "@/services/reviews.service";
import { DispatchOverview } from "@/components/DispatchOverview";
import { StatusBadge } from "@/components/ui/minimal";
import { OverviewPanels } from "@/components/OverviewPanels";
export const dynamic = "force-dynamic";
export default async function Page() {
  const token = await getAuthUserFromCookies();
  if (!token) return null;
  const [user, jobs, requests, reviews] = await Promise.all([
    getActiveUserById(token.userId),
    getTechnicianJobs(token.userId),
    getTechnicianRequests(token.userId),
    getTechnicianReviews(token.userId),
  ]);
  const active = jobs.filter(
    (j) => j.status !== "completed" && j.status !== "cancelled",
  );
  const pending = requests.filter((r) => r.status === "pending");
  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1,
      )
    : "—";
  const base = "/dashboard/technician";
  return (
    <div className="dashboard-overview technician-overview">
      <header className="page-heading">
        <div>
          <p className="eyebrow">GOOD WORK STARTS CLOSE TO HOME.</p>
          <h1>สวัสดี คุณ{user?.fullName.split(" ")[0]}</h1>
          <p>จัดการงานวันนี้ และพบลูกค้าใหม่ใกล้คุณ</p>
        </div>
        <span className="outline-label">THUNDERFIX PARTNER</span>
      </header>
      <DispatchOverview role="technician" />
      <div className="quick-actions">
        {[
          {
            name: "ค้นหางานใหม่",
            mobileName: "ค้นหางาน",
            path: "explore",
            icon: Search,
          },
          {
            name: "ตั้งบริการและราคา",
            mobileName: "บริการ",
            path: "services",
            icon: Wrench,
          },
          {
            name: "กำหนดพื้นที่รับงาน",
            mobileName: "พื้นที่รับงาน",
            path: "profile",
            icon: MapPin,
          },
          {
            name: "ข้อความจากลูกค้า",
            mobileName: "ข้อความ",
            path: "chat",
            icon: MessageSquare,
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
          <small>กำลังดูแลงาน</small>
          <strong>
            {active.length}
            <span className="metric-unit">งาน</span>
          </strong>
        </div>
        <div>
          <small>รอลูกค้ายืนยัน</small>
          <strong>
            {pending.length}
            <span className="metric-unit">งาน</span>
          </strong>
        </div>
        <div>
          <small>งานเสร็จสิ้น</small>
          <strong>
            {jobs.filter((j) => j.status === "completed").length}
            <span className="metric-unit">งาน</span>
          </strong>
        </div>
        <div>
          <small>คะแนนจาก {reviews.length} รีวิว</small>
          <strong>
            {average}
            <span className="metric-unit">/ 5</span>
          </strong>
        </div>
      </div>
      <OverviewPanels secondaryLabel="รอลูกค้ายืนยัน">
        <section>
          <div className="overview-section-title">
            <h2>งานที่ต้องดูแล</h2>
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
                <p>{j.addressText}</p>
                <p className="line-clamp-2">{j.description}</p>
              </Link>
            ))
          ) : (
            <div className="empty-panel">
              <BriefcaseBusiness size={33} />
              <h3>พร้อมสำหรับงานถัดไป</h3>
              <p>เปิดรับงานด่วน หรือเลือกดูประกาศในตลาดงาน</p>
              <Link className="button secondary" href={`${base}/urgent`}>
                ดูงานด่วนใกล้ฉัน <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </section>
        <section>
          <div className="overview-section-title">
            <h2>ข้อเสนอที่รอลูกค้า</h2>
            <span className="eyebrow">PENDING</span>
          </div>
          {pending.length ? (
            pending.map((r) => (
              <Link
                key={r.id}
                className="job-row"
                href={`${base}/jobs/${r.jobId}`}
              >
                <div className="job-row-heading">
                  <h3>งานซ่อม #{r.jobId}</h3>
                  <span className="status-pill orange-pill">รอการยืนยัน</span>
                </div>
                <p>
                  {r.quotedPrice
                    ? `ราคาเสนอ ฿${r.quotedPrice.toLocaleString("th-TH")}`
                    : "ประเมินราคาหน้างาน"}
                </p>
              </Link>
            ))
          ) : (
            <div className="empty-panel">
              <p>
                ยังไม่มีข้อเสนอที่รอการยืนยัน
                <br />
                ข้อเสนองานด่วนติดตามได้ในหน้างานด่วน
              </p>
              <Link className="text-link" href={`${base}/urgent`}>
                ไปที่งานด่วน <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </section>
      </OverviewPanels>
    </div>
  );
}
