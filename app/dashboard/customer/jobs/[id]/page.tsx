import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getJobDetails } from "@/services/jobs.service";
import { getJobRequests } from "@/services/job-requests.service";
import { getActiveUserById } from "@/services/auth.service";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { getJobReview } from "@/services/reviews.service";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import { JobJourney } from "@/components/JobJourney";
import { ExpandableJobText } from "@/components/ExpandableJobText";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; color: string }> = {
  requested: {
    label: "รอช่างตอบรับ/เสนอราคา",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  accepted: {
    label: "รับงานแล้ว",
    color: "bg-sky-100 text-sky-800 border-sky-200",
  },
  on_the_way: {
    label: "กำลังเดินทาง",
    color: "bg-violet-100 text-violet-800 border-violet-200",
  },
  in_progress: {
    label: "กำลังดำเนินงาน",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  completed: {
    label: "เสร็จสิ้น",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  cancelled: {
    label: "ยกเลิก",
    color: "bg-stone-100 text-stone-600 border-stone-200",
  },
};

export default async function CustomerJobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) redirect("/login");

  const job = await getJobDetails(id);
  if (!job) {
    return (
      <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-3xl min-h-[400px] flex items-center justify-center font-medium">
        ไม่พบข้อมูลงานซ่อมนี้
      </div>
    );
  }

  // Ensure this job belongs to the current user
  if (job.customerId !== tokenUser.userId) {
    redirect("/dashboard/customer");
  }
  const [urgent] = await db.execute<RowDataPacket[]>(
    `SELECT job_id FROM urgent_dispatch WHERE job_id = ?`,
    [id],
  );
  if (urgent.length && job.status === "requested")
    redirect("/dashboard/customer/urgent");

  const requests = await getJobRequests(id);
  const [categoryRows] = await db.execute<RowDataPacket[]>(
    `SELECT name FROM service_categories WHERE id = ?`,
    [job.categoryId],
  );
  const existingReview = await getJobReview(id);

  // Need technician info for assigned technician
  let assignedTechnician = null;
  if (job.technicianId) {
    assignedTechnician = await getActiveUserById(job.technicianId);
  }

  const statusInfo = statusLabels[job.status] || {
    label: job.status,
    color: "bg-stone-100 text-stone-800",
  };

  return (
    <div className="customer-job-detail space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-row items-start justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-stone-100">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
            <div className="w-1.5 h-5 md:h-6 bg-amber-500 rounded-full shrink-0"></div>
            <h1 className="text-xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400 leading-tight tracking-tight drop-shadow-sm truncate">
              {job.title}
            </h1>
            <span
              className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap border ${statusInfo.color} shadow-sm uppercase tracking-wider`}
            >
              {statusInfo.label}
            </span>
          </div>
          <p className="text-[10px] md:text-sm text-stone-500 font-medium flex flex-wrap items-center gap-1.5 md:gap-2">
            <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600">
              รหัสงาน: #{job.id}
            </span>
            <span className="hidden md:inline">•</span>
            <span>
              สร้างเมื่อ {new Date(job.createdAt).toLocaleDateString("th-TH")}
            </span>
          </p>
        </div>
        <Link
          href="/dashboard/customer/jobs"
          aria-label="กลับไปหน้างานซ่อมของฉัน"
          className="shrink-0 inline-flex justify-center items-center gap-2 w-10 h-10 md:w-auto md:px-4 md:py-2 bg-white border border-stone-200 rounded-xl md:rounded-xl rounded-full font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 hover:border-stone-300 transition-all text-sm md:text-base shadow-sm group"
        >
          <svg
            className="w-5 h-5 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          <span className="hidden md:inline">กลับไปหน้ารวม</span>
        </Link>
      </header>

      <JobJourney jobId={job.id} status={job.status} />
      <div className="job-detail-columns flex flex-col lg:grid lg:grid-cols-3 gap-6">
        <div className="job-detail-main lg:col-span-2 space-y-6 order-2 lg:order-1">
          {/* Job Details Card */}
          <div className="job-facts-card bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
            <div className="job-facts-heading border-b border-stone-100 bg-stone-50/50 px-8 py-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                รายละเอียดงานซ่อม
              </h2>
            </div>
            <div className="job-facts-body p-8 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-stone-400 mb-2 uppercase tracking-wider">
                  อาการ/รายละเอียด
                </h3>
                <div className="bg-stone-50/80 p-5 rounded-2xl border border-stone-100">
                  <ExpandableJobText text={job.description} />
                </div>
              </div>

              <div className="job-facts-grid grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6 pt-6 border-t border-stone-100">
                <div>
                  <h3 className="text-sm font-bold text-stone-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>{" "}
                    สถานที่
                  </h3>
                  <ExpandableJobText text={job.addressText} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      ></path>
                    </svg>{" "}
                    หมวดหมู่
                  </h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
                    {categoryRows[0]?.name || `หมวดบริการ #${job.categoryId}`}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-stone-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>{" "}
                    วัน/เวลาที่สะดวก
                  </h3>
                  <p className="text-stone-900 font-medium bg-amber-50/50 inline-block px-3 py-1.5 rounded-lg border border-amber-100 text-amber-900">
                    {job.preferredDate
                      ? new Date(job.preferredDate).toLocaleDateString("th-TH")
                      : "ไม่ระบุวัน"}
                    {job.preferredTime ? ` เวลา ${job.preferredTime}` : ""}
                  </p>
                </div>

                {job.finalPrice !== null && (
                  <div className="job-final-price bg-emerald-50 p-4 rounded-xl border border-emerald-100 -m-2">
                    <h3 className="text-sm font-bold text-emerald-700 mb-1 uppercase tracking-wider">
                      ราคาสุทธิ (ประเมินแล้ว)
                    </h3>
                    <p className="text-2xl font-black text-emerald-600">
                      {job.finalPrice.toLocaleString()} บาท
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technician Offers */}
          {job.status === "requested" && (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
              <div className="border-b border-stone-100 bg-stone-50/50 px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                    ข้อเสนอจากช่าง
                  </h2>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full">
                  {requests.length} ข้อเสนอ
                </span>
              </div>

              {requests.length > 0 ? (
                <div className="divide-y divide-stone-100 p-2">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-6 flex flex-col md:flex-row gap-6 hover:bg-stone-50/50 transition-colors rounded-2xl"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-stone-700 to-stone-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                            T
                          </div>
                          <div>
                            <h3 className="font-bold text-stone-900 text-lg">
                              ช่าง (รหัส: {req.technicianId})
                            </h3>
                            <p className="text-xs font-medium text-stone-500 flex items-center gap-1 mt-0.5">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                              </svg>
                              เสนอเมื่อ:{" "}
                              {new Date(req.createdAt).toLocaleString("th-TH")}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 relative">
                          <div className="absolute -left-3 top-2 text-amber-200">
                            <svg
                              className="w-8 h-8 opacity-50"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                          </div>
                          <p className="text-sm text-stone-700 font-medium pl-8 py-2 relative z-10">
                            {req.message || "พร้อมรับงานนี้ครับ"}
                          </p>
                        </div>
                        <div className="mt-5 bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
                          <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                            ราคาประเมินเบื้องต้น
                          </span>
                          <span
                            className={`font-black text-xl ${req.quotedPrice !== null ? "text-stone-900" : "text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 text-sm"}`}
                          >
                            {req.quotedPrice !== null
                              ? `${req.quotedPrice.toLocaleString()} บาท`
                              : "ประเมินหลังตรวจเช็คหน้างาน"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-row md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-stone-100 pt-5 md:pt-0 md:pl-6">
                        {req.status === "pending" ? (
                          <>
                            <form
                              action={`/api/customer/jobs/${job.id}/accept`}
                              method="POST"
                              className="flex-1 md:flex-none"
                            >
                              <input
                                type="hidden"
                                name="requestId"
                                value={req.id}
                              />
                              <input
                                type="hidden"
                                name="technicianId"
                                value={req.technicianId}
                              />
                              <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  ></path>
                                </svg>
                                รับข้อเสนอ
                              </button>
                            </form>
                            <form
                              action={`/api/customer/jobs/${job.id}/reject`}
                              method="POST"
                              className="flex-1 md:flex-none"
                            >
                              <input
                                type="hidden"
                                name="requestId"
                                value={req.id}
                              />
                              <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-stone-200 text-stone-600 font-bold rounded-xl hover:bg-stone-50 hover:border-stone-300 hover:text-stone-800 transition-all active:translate-y-0.5"
                              >
                                ปฏิเสธ
                              </button>
                            </form>
                          </>
                        ) : (
                          <div
                            className={`px-4 py-3 text-center text-sm font-bold rounded-xl border ${req.status === "accepted" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}
                          >
                            {req.status === "accepted"
                              ? "ยอมรับข้อเสนอแล้ว"
                              : "ปฏิเสธข้อเสนอแล้ว"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-4 shadow-inner border border-stone-100">
                    <div className="relative">
                      <svg
                        className="w-8 h-8 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-stone-900 font-bold text-lg mb-1">
                    กำลังรอช่างติดต่อกลับ...
                  </p>
                  <p className="text-sm font-medium text-stone-500 max-w-sm">
                    ช่างในพื้นที่จะเห็นงานซ่อมของคุณและสามารถส่งข้อเสนอราคามาได้ที่นี่
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Assigned Technician & Actions */}
        <div className="job-detail-sidebar space-y-6 order-1 lg:order-2">
          <div className="assigned-technician-card bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-stone-800"></div>
            <div className="assigned-card-heading border-b border-stone-100 bg-stone-50/50 px-6 py-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </div>
              <h2 className="font-bold text-stone-900 tracking-tight">
                ช่างที่รับผิดชอบ
              </h2>
            </div>

            {assignedTechnician ? (
              <div
                className="assigned-card-body p-6"
                data-job-status={job.status}
              >
                <div className="assigned-identity flex flex-col items-center text-center mb-6 pt-2">
                  <div className="assigned-avatar w-24 h-24 bg-gradient-to-br from-stone-800 to-stone-900 text-white rounded-full flex items-center justify-center font-black text-3xl mb-4 shadow-xl shadow-stone-900/20 ring-4 ring-stone-100 relative overflow-hidden">
                    {assignedTechnician.avatarUrl ? (
                      <img
                        src={assignedTechnician.avatarUrl}
                        alt={`รูปของ ${assignedTechnician.fullName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      assignedTechnician.fullName.charAt(0)
                    )}
                  </div>
                  <h3 className="font-extrabold text-xl text-stone-900 mb-1">
                    {assignedTechnician.fullName}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold border border-stone-200">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      ></path>
                    </svg>
                    {assignedTechnician.phone || "ไม่มีเบอร์โทร"}
                  </span>
                </div>

                <div className="assigned-actions space-y-4 pt-4 border-t border-stone-100">
                  {job.status === "cancelled" ? (
                    <div className="w-full p-4 bg-red-50 rounded-xl border border-red-100 text-center flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-1">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-red-700">
                        งานซ่อมนี้ถูกยกเลิกแล้ว
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Create Chat Button */}
                      <form action={`/api/customer/chat/start`} method="POST">
                        <input type="hidden" name="jobId" value={job.id} />
                        <input
                          type="hidden"
                          name="technicianId"
                          value={job.technicianId || ""}
                        />
                        <button
                          type="submit"
                          aria-label="แชตกับช่าง"
                          title="แชตกับช่าง"
                          className="mobile-icon-action w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            ></path>
                          </svg>
                          <span className="mobile-command-label">
                            แชทกับช่าง
                          </span>
                        </button>
                      </form>

                      {job.status === "completed" &&
                        (existingReview ? (
                          <div className="w-full p-5 bg-stone-50 rounded-xl border border-stone-200">
                            <div className="flex items-center justify-center gap-1 mb-3 bg-white w-fit mx-auto px-3 py-1.5 rounded-full shadow-sm border border-stone-100">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-5 h-5 ${i < existingReview.rating ? "text-amber-500" : "text-stone-200"}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                </svg>
                              ))}
                            </div>
                            <p className="text-sm font-bold text-stone-900 mb-2 text-center text-emerald-700 flex items-center justify-center gap-1.5">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                              </svg>
                              คุณรีวิวงานนี้แล้ว
                            </p>
                            {existingReview.comment && (
                              <p className="text-sm text-stone-600 italic text-center p-3 bg-white rounded-lg border border-stone-100 shadow-sm relative">
                                <span className="absolute -top-2 -left-1 text-2xl text-stone-200 leading-none font-serif">
                                  "
                                </span>
                                {existingReview.comment}
                                <span className="absolute -bottom-3 -right-1 text-2xl text-stone-200 leading-none font-serif">
                                  "
                                </span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={`/dashboard/customer/jobs/${job.id}/review`}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20 hover:shadow-lg hover:-translate-y-0.5"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              ></path>
                            </svg>
                            ให้คะแนนช่าง
                          </Link>
                        ))}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="assigned-empty p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mx-auto mb-4 border border-stone-100 shadow-inner">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </div>
                <h3 className="font-bold text-stone-900 mb-1">
                  ยังไม่มีช่างรับผิดชอบ
                </h3>
                <p className="text-stone-500 text-sm font-medium">
                  เมื่อมีช่างรับงาน ข้อมูลของช่างจะแสดงที่นี่
                </p>
              </div>
            )}
          </div>

          {job.status === "requested" && (
            <form
              action={`/api/customer/jobs/${job.id}/cancel`}
              method="POST"
              className="mt-4"
            >
              <ConfirmSubmitButton
                type="submit"
                className="w-full text-center text-red-500 font-bold text-sm hover:text-red-700 hover:bg-red-50 py-3 rounded-xl transition-colors"
                confirmMessage="ต้องการยกเลิกการแจ้งซ่อมนี้ใช่หรือไม่?"
              >
                ยกเลิกงานซ่อม
              </ConfirmSubmitButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
