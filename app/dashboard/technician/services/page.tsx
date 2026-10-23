import { getAuthUserFromCookies } from "@/lib/auth";
import { getTechnicianServices } from "@/services/technician-services.service";
import { getActiveCategories } from "@/services/categories.service";
import { redirect } from "next/navigation";
import { ServiceCard } from "@/components/ServiceCard";
import { AddServiceModal } from "./AddServiceModal";

export const dynamic = "force-dynamic";

export default async function TechnicianServicesPage() {
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) redirect("/login");

  const [myServices, allCategories] = await Promise.all([
    getTechnicianServices(tokenUser.userId),
    getActiveCategories()
  ]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300 max-w-4xl mx-auto pb-24">
      {/* Slim Header */}
      <header className="flex items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <h1 className="text-lg font-black text-stone-900 leading-tight">บริการของคุณ</h1>
          <p className="text-xs text-stone-500">
            ทั้งหมด <span className="font-bold text-amber-600">{myServices.length}</span> บริการ
          </p>
        </div>
        <AddServiceModal allCategories={allCategories} />
      </header>

      {/* Services List */}
      {myServices.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {myServices.map((service, idx) => (
            <div
              key={service.id}
              className="animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "both" }}
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-950 text-amber-400 rotate-6">
            <svg className="h-7 w-7 -rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" /></svg>
          </div>
          <h3 className="text-base font-black text-stone-900">ยังไม่มีบริการ</h3>
          <p className="mt-1 text-sm text-stone-500">กดปุ่ม <span className="font-bold text-stone-900">+</span> ด้านบนเพื่อเพิ่มงานที่คุณรับ</p>
        </div>
      )}
    </div>
  );
}
