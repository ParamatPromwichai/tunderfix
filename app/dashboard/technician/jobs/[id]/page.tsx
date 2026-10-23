import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getJobDetails } from "@/services/jobs.service";
import { getActiveUserById } from "@/services/auth.service";
import { getTechnicianRequests } from "@/services/job-requests.service";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string, color: string }> = {
  requested: { label: "รอตอบรับ", color: "bg-amber-100 text-amber-800 border-amber-200" },
  accepted: { label: "นัดหมายแล้ว", color: "bg-sky-100 text-sky-800 border-sky-200" },
  on_the_way: { label: "กำลังเดินทาง", color: "bg-violet-100 text-violet-800 border-violet-200" },
  in_progress: { label: "กำลังดำเนินงาน", color: "bg-blue-100 text-blue-800 border-blue-200" },
  completed: { label: "เสร็จสิ้น", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "ยกเลิก", color: "bg-stone-100 text-stone-800 border-stone-200" },
};

export default async function TechnicianJobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) redirect("/login");

  const job = await getJobDetails(id);
  if (!job) {
    return <div className="p-12 text-center text-stone-500 font-medium">ไม่พบข้อมูลงานซ่อมนี้</div>;
  }

  // Ensure this tech is assigned to this job, or it's open (for quotes).
  
  const customer = await getActiveUserById(job.customerId);
  const techRequests = await getTechnicianRequests(tokenUser.userId);
  const myRequest = techRequests.find(r => r.jobId === id);

  const statusInfo = statusLabels[job.status] || { label: job.status, color: "bg-stone-100 text-stone-800 border-stone-200" };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-row items-start justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-stone-100">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
            <div className="w-1.5 h-5 md:h-6 bg-amber-500 rounded-full shrink-0"></div>
            <h1 className="text-xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400 leading-tight tracking-tight drop-shadow-sm truncate">{job.title}</h1>
            <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap border ${statusInfo.color} shadow-sm uppercase tracking-wider`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="text-[10px] md:text-sm text-stone-500 font-medium flex flex-wrap items-center gap-1.5 md:gap-2">
            <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600">รหัสงาน: #{job.id}</span>
            <span className="hidden md:inline">•</span>
            <span>สร้างเมื่อ {new Date(job.createdAt).toLocaleDateString('th-TH')}</span>
          </p>
        </div>
        <Link href="/dashboard/technician/jobs" className="shrink-0 inline-flex justify-center items-center gap-2 w-10 h-10 md:w-auto md:px-4 md:py-2 bg-white border border-stone-200 rounded-xl md:rounded-xl rounded-full font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 hover:border-stone-300 transition-all text-sm md:text-base shadow-sm group">
          <svg className="w-5 h-5 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <span className="hidden md:inline">กลับไปหน้ารวม</span>
        </Link>
      </header>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="bg-white rounded-3xl shadow-lg shadow-amber-900/5 border border-amber-100 overflow-hidden">
            <div className="border-b border-amber-50 bg-gradient-to-r from-amber-50/50 to-white px-6 py-4">
              <h2 className="font-bold text-stone-900 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-amber-400 rounded-full"></span>
                รายละเอียดสำหรับช่าง
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  ปัญหาที่ลูกค้าแจ้ง
                </h3>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-amber-50/50">
                <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 group-hover:text-amber-500 transition-colors">สถานที่</h3>
                  <p className="text-stone-900 font-medium">{job.addressText}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 group-hover:text-amber-500 transition-colors">วัน/เวลาที่สะดวก</h3>
                  <p className="text-stone-900 font-medium">
                    {job.preferredDate ? new Date(job.preferredDate).toLocaleDateString('th-TH') : 'ไม่ระบุวัน'} 
                    <span className="text-amber-600">{job.preferredTime ? ` เวลา ${job.preferredTime}` : ''}</span>
                  </p>
                </div>
                
                {job.finalPrice !== null && (
                  <div className="md:col-span-2 bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-100 shadow-sm flex justify-between items-center">
                    <h3 className="text-sm font-bold text-emerald-800">ราคาสุทธิที่ตกลง</h3>
                    <p className="text-2xl font-black text-emerald-700">{job.finalPrice.toLocaleString()} <span className="text-base font-bold text-emerald-600">บาท</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {job.status === 'requested' && !myRequest && (
            <div className="bg-white rounded-3xl shadow-lg shadow-amber-900/5 border border-amber-100 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
              <div className="border-b border-amber-50 bg-gradient-to-r from-amber-50/50 to-white px-6 py-5">
                <h2 className="font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-amber-400 rounded-full"></span>
                  ตอบรับงาน / เสนอราคา
                </h2>
              </div>
              <div className="p-6">
                <form action="/api/technician/requests" method="POST" className="space-y-5">
                  <input type="hidden" name="jobId" value={job.id} />
                  
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1.5">ราคาประเมินเบื้องต้น <span className="text-stone-400 font-normal">(ถ้ามี)</span></label>
                    <div className="relative">
                      <input type="number" name="quotedPrice" placeholder="เช่น 500 (ไม่ใส่ = ประเมินหน้างาน)" className="w-full h-12 rounded-xl border border-stone-200 px-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm" />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <span className="text-stone-400 font-medium text-sm">บาท</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1.5">ข้อความเพิ่มเติมถึงลูกค้า <span className="text-stone-400 font-normal">(ไม่บังคับ)</span></label>
                    <textarea name="message" rows={3} placeholder="เช่น สามารถเข้าไปดูให้ได้วันนี้เลยครับ หรือ ขอเช็คอาการก่อนประเมินราคาครับ" className="w-full rounded-xl border border-stone-200 p-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm resize-none"></textarea>
                  </div>

                  <button type="submit" className="w-full px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 text-lg">
                    ส่งการตอบรับ
                  </button>
                </form>
              </div>
            </div>
          )}

          {myRequest && (
             <div className="bg-white rounded-3xl shadow-lg shadow-amber-900/5 border border-amber-100 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500"></div>
              <div className="border-b border-amber-50 bg-gradient-to-r from-amber-50/50 to-white px-6 py-5">
                <h2 className="font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-amber-400 rounded-full"></span>
                  ข้อเสนอของคุณ
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <p className="text-stone-600 text-sm mb-1 font-semibold uppercase tracking-wider">ข้อความ:</p>
                  <p className="text-stone-900">{myRequest.message}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex justify-between items-center">
                  <p className="text-amber-800 text-sm font-semibold uppercase tracking-wider">ราคาประเมิน:</p>
                  <p className="text-amber-700 font-bold text-lg">{myRequest.quotedPrice ? `${myRequest.quotedPrice} บาท` : 'ประเมินหน้างาน'}</p>
                </div>
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-500">สถานะข้อเสนอ</span>
                  <span className={`inline-flex px-3.5 py-1.5 rounded-lg text-xs font-bold border shadow-sm ${
                    myRequest.status === 'accepted' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    myRequest.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                  }`}>
                    {myRequest.status === 'pending' ? 'รอลูกค้าตอบรับ' : myRequest.status === 'accepted' ? 'ลูกค้ายอมรับแล้ว' : 'ลูกค้าปฏิเสธ'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 order-1 lg:order-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="bg-white rounded-3xl shadow-lg shadow-amber-900/5 border border-amber-100 overflow-hidden">
            <div className="border-b border-amber-50 bg-gradient-to-r from-amber-50/50 to-white px-6 py-4">
              <h2 className="font-bold text-stone-900 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-amber-400 rounded-full"></span>
                ข้อมูลลูกค้า
              </h2>
            </div>
            
            {customer ? (
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 rounded-full flex items-center justify-center font-black text-2xl shadow-inner border border-amber-300">
                    {customer.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">{customer.fullName}</h3>
                    <p className="text-sm text-stone-500 font-medium flex items-center gap-1.5 mt-0.5">
                      <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      {customer.phone || 'ไม่มีเบอร์โทร'}
                    </p>
                  </div>
                </div>
                
                {job.technicianId === tokenUser.userId && (
                  <div className="space-y-3 pt-4 border-t border-stone-100">
                    <form action={`/api/technician/chat/start`} method="POST">
                      <input type="hidden" name="jobId" value={job.id} />
                      <input type="hidden" name="customerId" value={customer.id} />
                      <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        แชทกับลูกค้า
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {job.technicianId === tokenUser.userId && (
            <div className="bg-white rounded-3xl shadow-lg shadow-amber-900/5 border border-amber-100 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-700 to-stone-900"></div>
              <div className="border-b border-stone-100 bg-stone-50 px-6 py-4">
                <h2 className="font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-stone-700 rounded-full"></span>
                  จัดการงาน
                </h2>
              </div>
              <div className="p-6">
                {job.status === 'completed' ? (
                  <div className="w-full p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center shadow-sm">
                    <p className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      คุณจบงานนี้ไปแล้ว
                    </p>
                  </div>
                ) : job.status === 'cancelled' ? (
                  <div className="w-full p-4 bg-red-50 rounded-xl border border-red-200 text-center shadow-sm">
                    <p className="text-sm font-bold text-red-700 flex items-center justify-center gap-1.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      งานซ่อมนี้ถูกยกเลิกแล้ว
                    </p>
                  </div>
                ) : job.status !== 'requested' ? (
                  <form action={`/api/technician/jobs/${job.id}/complete`} method="POST" className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5">ราคาสุทธิ <span className="text-stone-400 font-normal">(บาท)</span></label>
                      <input type="number" name="finalPrice" placeholder="เช่น 1500" required className="w-full h-12 rounded-xl border border-stone-200 px-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm font-semibold" />
                    </div>
                    <ConfirmSubmitButton type="submit" confirmMessage="ยืนยันว่างานเสร็จสิ้นแล้วและต้องการบันทึกราคานี้ใช่หรือไม่?" className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 text-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      ระบุราคา & จบงานซ่อม
                    </ConfirmSubmitButton>
                  </form>
                ) : (
                  <div className="w-full p-4 bg-amber-50 rounded-xl border border-amber-200 text-center shadow-sm">
                    <p className="text-sm font-bold text-amber-700 flex items-center justify-center gap-1.5 animate-pulse">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      รอลูกค้าตอบรับก่อนจึงจะจบงานได้
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
