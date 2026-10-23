import Link from "next/link";
import { getAuthUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";
import { searchTechnicians } from "@/services/technicians-explore.service";
import { getActiveCategories } from "@/services/categories.service";
import { ExploreFilters } from "@/components/ExploreFilters";
import { Card, EmptyState, PageHeader, btnPrimary } from "@/components/ui/minimal";

export const dynamic = "force-dynamic";

export default async function CustomerExplorePage({ searchParams }: { searchParams: Promise<{ category?: string, lat?: string, lng?: string }> }) {
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) redirect("/login");

  const { category, lat, lng } = await searchParams;
  
  // Default to BKK for demo purposes if not provided
  const latitude = lat ? parseFloat(lat) : 13.7563;
  const longitude = lng ? parseFloat(lng) : 100.5018;

  const categories = await getActiveCategories();
  const technicians = await searchTechnicians(latitude, longitude, category);

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-24 animate-in fade-in duration-300">
      <PageHeader
        title="ค้นหาช่างใกล้คุณ"
        subtitle={<>พบ <span className="font-bold text-amber-600">{technicians.length}</span> ช่างในพื้นที่</>}
      />

      <ExploreFilters 
        categories={categories} 
        category={category} 
        latitude={latitude} 
        longitude={longitude} 
        technicians={technicians} 
        hasLocationParam={!!lat && !!lng}
      />

      {technicians.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {technicians.map((tech, index) => (
            <Card
              key={tech.id}
              hover
              className="flex flex-col p-4 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="flex items-center gap-3" style={{ animationDelay: `${index * 40}ms` }}>
                <img
                  src={tech.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(tech.fullName)}&backgroundColor=f59e0b&textColor=ffffff`}
                  alt={tech.fullName}
                  className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-stone-200"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-bold text-stone-900">{tech.fullName}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                    <svg className="h-3.5 w-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="font-semibold text-stone-800">{tech.averageRating}</span>
                    <span className="text-stone-400">({tech.totalReviews})</span>
                    <span className="text-stone-300">·</span>
                    {tech.distanceKm.toFixed(1)} กม.
                  </p>
                </div>
              </div>

              {tech.categoryName && (
                <p className="mt-3 text-xs text-stone-500">
                  <span className="font-semibold text-stone-800">{tech.categoryName}</span>
                  <span className="mx-1.5 text-stone-300">·</span>
                  ประสบการณ์ {tech.yearsExperience} ปี
                </p>
              )}

              <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-600">
                {tech.serviceDescription || tech.bio || <span className="italic text-stone-400">ไม่มีข้อมูลเพิ่มเติม</span>}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
                <div className="min-w-0">
                  <p className="text-xs text-stone-400">ช่วงราคา</p>
                  <p className="truncate text-[15px] font-bold tabular-nums text-stone-900">
                    {tech.priceMin !== null
                      ? <>฿{tech.priceMin.toLocaleString()}{tech.priceMax ? <> <span className="font-normal text-stone-300">–</span> {tech.priceMax.toLocaleString()}</> : '+'}</>
                      : <span className="text-amber-600">ประเมินหน้างาน</span>}
                  </p>
                </div>
                <Link href={`/dashboard/customer/jobs/new?technicianId=${tech.userId}&categoryId=${tech.categoryId}`} className={btnPrimary}>
                  จ้างช่าง
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          title="ไม่พบช่างที่ตรงกับเงื่อนไข"
          description="ลองเปลี่ยนหมวดหมู่ หรือขยายพื้นที่การค้นหา"
        />
      )}
    </div>
  );
}
