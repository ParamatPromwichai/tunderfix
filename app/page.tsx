import Link from "next/link";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getActiveUserById } from "@/services/auth.service";
import { getHomeDashboard } from "@/services/home.service";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const numberFormatter = new Intl.NumberFormat("th-TH");

const statusLabels: Record<string, string> = {
  requested: "รอช่างตอบ",
  accepted: "นัดหมายแล้ว",
  on_the_way: "กำลังเดินทาง",
  in_progress: "กำลังดำเนินงาน",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
};

// Map categories to high-quality Unsplash images for a realistic look
const categoryImages: Record<string, string> = {
  "ซ่อมแอร์": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
  "ซ่อมไฟฟ้า": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800&auto=format&fit=crop",
  "ซ่อมประปา": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
  "ซ่อมคอมพิวเตอร์": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=800&auto=format&fit=crop",
};

function getCategoryImage(name: string, index: number) {
  if (categoryImages[name]) return categoryImages[name];
  const defaults = [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581092921461-7031e4bf0e5e?q=80&w=800&auto=format&fit=crop"
  ];
  return defaults[index % defaults.length];
}

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatRating(value: number): string {
  return value > 0 ? value.toFixed(1) : "ใหม่";
}

function formatBudget(min: number | null, max: number | null): string {
  if (min !== null && max !== null) {
    return `${formatNumber(min)}-${formatNumber(max)} บาท`;
  }
  if (min !== null) return `เริ่ม ${formatNumber(min)} บาท`;
  if (max !== null) return `ไม่เกิน ${formatNumber(max)} บาท`;
  return "รอประเมินราคา";
}

function formatPrice(min: number | null, max: number | null): string {
  if (min !== null && max !== null) {
    return `${formatNumber(min)}-${formatNumber(max)} บาท`;
  }
  if (min !== null) return `เริ่ม ${formatNumber(min)} บาท`;
  return "ประเมินหน้างาน";
}

async function getCurrentUser() {
  try {
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser) return null;
    return await getActiveUserById(tokenUser.userId);
  } catch (error) {
    console.error("[home] Unable to load authenticated user:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

export default async function Home() {
  const [dashboard, currentUser] = await Promise.all([
    getHomeDashboard(),
    getCurrentUser(),
  ]);
  const { categories, technicians, recentJobs, stats, isDatabaseConnected } = dashboard;

  const statCards = [
    { value: `${formatNumber(stats.totalJobs)}+`, label: "งานซ่อมสำเร็จแล้ว" },
    { value: formatNumber(stats.technicianCount), label: "ช่างมืออาชีพในระบบ" },
    { value: formatNumber(stats.openJobs), label: "งานซ่อมที่กำลังเปิดอยู่" },
  ];

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-amber-200">
      
      {/* Clean White Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="grid h-8 w-8 place-items-center rounded bg-amber-600 text-sm font-bold text-white">
              TF
            </div>
            <span className="text-lg font-extrabold text-stone-900 tracking-tight">ThunderFix</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a className="hover:text-amber-600 transition-colors" href="#services">บริการของเรา</a>
            <a className="hover:text-amber-600 transition-colors" href="#technicians">ช่างแนะนำ</a>
            <a className="hover:text-amber-600 transition-colors" href="#features">ทำไมต้องเรา</a>
          </nav>
          
          {currentUser ? (
            <div className="flex shrink-0 items-center gap-4">
              <Link href={`/dashboard/customer/profile`} className="hidden sm:flex items-center gap-2 hover:bg-stone-50 p-1.5 rounded-full transition border border-transparent hover:border-stone-200">
                <img src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName)}&backgroundColor=059669&textColor=ffffff`} alt="Profile" className="w-8 h-8 rounded-full bg-stone-200 object-cover" />
                <span className="max-w-[120px] truncate text-sm font-semibold text-stone-700">
                  {currentUser.fullName}
                </span>
              </Link>
              <Link
                href={`/dashboard/${currentUser.role}`}
                className="inline-flex h-9 items-center justify-center rounded-md bg-stone-100 px-4 text-sm font-bold text-stone-900 transition hover:bg-stone-200"
              >
                แดชบอร์ด
              </Link>
              <LogoutButton className="hidden sm:inline-flex h-9 items-center justify-center rounded-md text-sm font-bold text-stone-500 hover:text-red-600 transition" />
            </div>
          ) : (
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md bg-amber-500 px-6 text-sm font-bold text-stone-950 transition hover:bg-amber-600"
              href="/login"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section - Split Layout with Image */}
      <section className="bg-white border-b border-stone-200 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-12 lg:py-20">
            {/* Left Content */}
            <div className="max-w-2xl">
              {!isDatabaseConnected && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  กำลังแสดงข้อมูลจำลอง (ยังไม่ได้ต่อ Database)
                </div>
              )}
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 leading-[1.15] tracking-tight mb-6">
                รวมช่างมืออาชีพ <br className="hidden sm:block" />
                <span className="text-amber-600">ซ่อมจบ ครบทุกปัญหาบ้าน</span>
              </h1>
              
              <p className="text-lg text-stone-600 leading-relaxed mb-8">
                หาช่างใกล้บ้านง่ายๆ ผ่าน ThunderFix คุยรายละเอียด เสนอราคา และตรวจสอบประวัติช่างได้ก่อนตัดสินใจ จ้างงานอย่างมั่นใจ ปลอดภัย 100%
              </p>

              {/* Search Box */}
              <form action="/dashboard/customer/explore" method="GET" className="bg-white border border-stone-200 rounded-2xl p-2 shadow-sm flex flex-col sm:flex-row gap-2 max-w-xl">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                  <input
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-stone-50 border border-transparent text-stone-900 placeholder-stone-500 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition text-sm"
                    name="q" placeholder="เช่น ซ่อมแอร์, ท่อน้ำรั่ว"
                  />
                </div>
                <div className="relative flex-1 sm:max-w-[180px]">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <input
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-stone-50 border border-transparent text-stone-900 placeholder-stone-500 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition text-sm"
                    name="area" placeholder="พื้นที่/เขต"
                  />
                </div>
                <button type="submit" className="h-12 sm:w-28 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold transition shadow-sm">
                  ค้นหา
                </button>
              </form>

              <div className="mt-10 flex items-center gap-6 sm:gap-8">
                {statCards.map((stat, i) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-black text-stone-900">{stat.value}</p>
                    <p className="text-xs font-semibold text-stone-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Real Photo Composition */}
            <div className="relative hidden lg:block h-[500px]">
              <div className="absolute top-0 right-0 w-[85%] h-[85%] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1000&auto=format&fit=crop" 
                  alt="ช่างมืออาชีพกำลังทำงาน" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 w-[55%] h-[50%] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop" 
                  alt="ช่างแอร์ทำความสะอาด" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Trust Badge */}
              <div className="absolute top-[60%] left-[-20px] bg-white rounded-xl p-4 shadow-lg border border-stone-100 flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">รับประกันผลงาน</p>
                  <p className="text-xs text-stone-500">ช่างผ่านการยืนยันตัวตน</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Categories Section with Images */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">บริการยอดฮิต</h2>
            <p className="text-stone-500 mt-2">เลือกหมวดหมู่งานซ่อมที่ลูกค้าเรียกใช้บ่อยที่สุด</p>
          </div>
          <a href="#" className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 transition">
            ดูบริการทั้งหมด <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
          </a>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.length ? (
            categories.map((category, index) => (
              <Link href={`/dashboard/customer/explore`} key={category.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-xl hover:shadow-stone-200/50 hover:border-amber-200 transition duration-300">
                <div className="h-48 overflow-hidden bg-stone-200">
                  <img 
                    src={getCategoryImage(category.name, index)} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-stone-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-4">
                    {category.description || "บริการงานซ่อมโดยช่างผู้เชี่ยวชาญในระบบ พร้อมประเมินราคาก่อนเริ่มงาน"}
                  </p>
                  <div className="mt-auto flex items-center justify-between text-sm">
                    <span className="font-semibold text-amber-600">
                      {formatNumber(category.totalJobs)} งานสำเร็จ
                    </span>
                    <span className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
              ยังไม่มีหมวดบริการในฐานข้อมูล เพิ่มข้อมูลในตาราง service_categories เพื่อเริ่มแสดงหมวดงาน
            </div>
          )}
        </div>
      </section>

      {/* Trust & Features Section */}
      <section id="features" className="bg-stone-900 text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
                ทำไมลูกค้าถึงมั่นใจเลือก <span className="text-amber-400">ThunderFix</span>
              </h2>
              <p className="text-stone-400 text-lg mb-10 leading-relaxed">
                เราตั้งใจสร้างแพลตฟอร์มที่ทำให้การซ่อมบ้านโปร่งใส ตรวจสอบได้ และจบปัญหาจุกจิกที่เคยเจอมา
              </p>
              
              <div className="space-y-8">
                {[
                  {
                    title: "ช่างมืออาชีพ ตรวจสอบประวัติได้",
                    desc: "ช่างทุกคนต้องยืนยันตัวตน และสามารถดูรีวิวจากผู้ใช้งานจริงก่อนตัดสินใจจ้างงาน",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  },
                  {
                    title: "ตกลงราคาก่อนเริ่มงานเสมอ",
                    desc: "ช่างจะประเมินราคาและส่งใบเสนอราคาผ่านระบบให้คุณอนุมัติก่อนลงมือทำ ไม่มีบวกเพิ่มหน้างาน",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  },
                  {
                    title: "ตามงานได้ผ่านระบบแชท",
                    desc: "พูดคุยและส่งรูปภาพปัญหาให้ช่างดูผ่านแชทในระบบ ข้อมูลไม่สูญหาย ตามงานง่าย",
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  }
                ].map((f, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 w-12 h-12 shrink-0 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{f.icon}</svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{f.title}</h4>
                      <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Collage image for features */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[500px] hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=1000&auto=format&fit=crop" 
                alt="ความน่าเชื่อถือของช่าง" 
                className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <img src="https://api.dicebear.com/7.x/initials/svg?seed=Pichai&backgroundColor=059669" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-bold text-white">คุณพิชัย (ช่างแอร์)</p>
                      <div className="flex text-amber-400 text-xs">
                        {"★".repeat(5)} <span className="text-stone-300 ml-1">5.0 (124 รีวิว)</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-stone-300 italic">"บริการดีเยี่ยม มาตรงเวลา อธิบายชัดเจนว่าต้องซ่อมตรงไหน ราคาตามที่ตกลงไว้ในระบบเลยครับ"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Techs & Recent Jobs */}
      <section className="bg-stone-50 border-t border-stone-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
            
            {/* Top Technicians */}
            <div id="technicians">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">ช่างแนะนำใกล้คุณ</h2>
                <p className="text-stone-500 mt-1">ช่างมืออาชีพที่ได้รับคะแนนรีวิวสูง</p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {technicians.length ? (
                  technicians.map((technician) => (
                    <article
                      key={technician.id}
                      className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden bg-stone-100 border border-stone-200">
                          <img 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(technician.name)}&backgroundColor=44403c&textColor=ffffff`}
                            alt={technician.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="truncate font-bold text-stone-900">{technician.name}</h3>
                            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">
                              ★ {formatRating(technician.rating)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-stone-500 line-clamp-1">{technician.skill}</p>
                          <div className="mt-3 flex items-center gap-2 text-xs">
                            <span className="px-2 py-1 rounded bg-stone-100 text-stone-600 font-medium">
                              ประสบการณ์ {technician.yearsExperience} ปี
                            </span>
                            <span className={`px-2 py-1 rounded font-bold ${technician.isAvailable ? 'bg-amber-50 text-amber-600' : 'bg-stone-100 text-stone-400'}`}>
                              {technician.isAvailable ? "ว่างรับงาน" : "คิวเต็ม"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 sm:col-span-2">
                    ยังไม่มีช่างในฐานข้อมูล
                  </div>
                )}
              </div>
            </div>

            {/* Recent Jobs Feed */}
            <div id="jobs" className="flex flex-col">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">งานซ่อมล่าสุด</h2>
                  <p className="text-stone-500 mt-1">อัปเดตงานในระบบแบบเรียลไทม์</p>
                </div>
              </div>
              
              <div className="flex-1 bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {recentJobs.length ? (
                    recentJobs.map((job) => (
                      <div
                        key={job.id}
                        className="group flex gap-4 rounded-lg p-3 hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-0"
                      >
                        <div className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center shrink-0 text-stone-400">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <p className="font-bold text-stone-900 truncate">{job.title}</p>
                            <span className="shrink-0 rounded bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                              {statusLabels[job.status] ?? job.status}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mb-1">
                            {job.area} · <span className="text-stone-700 font-medium">{job.categoryName}</span>
                          </p>
                          <p className="text-xs font-bold text-amber-600">
                            {formatBudget(job.budgetMin, job.budgetMax)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center p-5 text-sm text-stone-500 text-center">
                      ยังไม่มีการเปิดงานซ่อม เมื่อมีงานใหม่จะแสดงที่นี่
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-stone-500 text-sm">
          <div className="flex justify-center items-center gap-2 mb-4">
             <div className="grid h-6 w-6 place-items-center rounded bg-stone-300 text-white font-bold text-[10px]">TF</div>
             <span className="font-bold text-stone-700">ThunderFix</span>
          </div>
          <p>© 2026 ThunderFix. บริการจัดหาช่างซ่อมบำรุงระดับมืออาชีพ</p>
        </div>
      </footer>
    </main>
  );
}
