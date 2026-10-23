import Link from "next/link";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getActiveUserById } from "@/services/auth.service";
import { getNavBadges } from "@/services/badges.service";
import { LogoutButton } from "@/app/logout-button";
import { redirect } from "next/navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileTopHeader } from "@/components/MobileTopHeader";

// Force hot reload
export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) {
    redirect("/login");
  }

  const currentUser = await getActiveUserById(tokenUser.userId);
  if (!currentUser || currentUser.role !== "customer") {
    redirect("/login");
  }

  const badges = await getNavBadges(currentUser.id, currentUser.role);

  const mobileNavItems = [
    { name: "หน้าแรก", href: "/dashboard/customer", iconName: "Home" as const },
    { name: "ค้นหาช่าง", href: "/dashboard/customer/explore", iconName: "Search" as const },
    { name: "โพสต์งาน", href: "/dashboard/customer/jobs/new", iconName: "Plus" as const, isAction: true },
    { name: "งานซ่อม", href: "/dashboard/customer/jobs", iconName: "Briefcase" as const },
    { name: "แชท", href: "/dashboard/customer/chat", iconName: "MessageSquare" as const, badge: badges.unreadMessages },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900 font-sans relative pb-16 md:pb-0">
      
      {/* Sidebar for Desktop */}
      <aside className="w-72 bg-stone-950 text-stone-300 flex-col shrink-0 hidden md:flex h-screen sticky top-0 shadow-2xl shadow-stone-900/50 z-10 border-r border-stone-800">
        <div className="p-6 flex items-center gap-4 border-b border-stone-800/50 bg-stone-900/30">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-xl font-black text-white shadow-lg shadow-amber-600/30">
            TF
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-stone-400">ThunderFix</h1>
            <p className="text-xs text-amber-500/80 font-medium tracking-wider uppercase mt-0.5">Customer Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
          <Link href="/dashboard/customer" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-800/80 hover:text-white transition-all duration-300 group">
            <svg className="w-5 h-5 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span className="font-medium">ภาพรวม</span>
          </Link>
          <Link href="/dashboard/customer/explore" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-800/80 hover:text-white transition-all duration-300 group">
            <svg className="w-5 h-5 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <span className="font-medium">ค้นหาช่าง</span>
          </Link>
          <Link href="/dashboard/customer/jobs" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-800/80 hover:text-white transition-all duration-300 group">
            <svg className="w-5 h-5 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            <span className="font-medium">งานซ่อมของฉัน</span>
          </Link>
          <div className="pt-2 pb-1">
            <Link href="/dashboard/customer/jobs/new" className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold transition-all shadow-md shadow-amber-900/20 hover:shadow-lg hover:shadow-amber-900/40 hover:-translate-y-0.5 group active:translate-y-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <svg className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              <span className="relative z-10">โพสต์หาช่างใหม่</span>
            </Link>
          </div>
          <div className="pt-6 pb-2">
            <p className="px-4 text-[11px] font-bold text-stone-600 uppercase tracking-widest">การสื่อสาร</p>
          </div>
          <Link href="/dashboard/customer/chat" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-800/80 hover:text-white transition-all duration-300 group relative">
            <svg className="w-5 h-5 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <span className="font-medium">ข้อความแชท</span>
            {badges.unreadMessages > 0 && <span className="ml-auto bg-amber-500 text-stone-900 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">{badges.unreadMessages}</span>}
          </Link>

        </nav>
        
        <div className="p-4 border-t border-stone-800/50 bg-stone-900/20">
          <Link href="/dashboard/customer/profile" className="flex items-center gap-3 mb-4 p-3 rounded-xl hover:bg-stone-800 transition-all duration-300 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center font-bold text-stone-200 shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-amber-500/50 transition-all">
              <img 
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName)}&backgroundColor=44403c&textColor=ffffff`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-stone-200 truncate group-hover:text-white transition-colors">{currentUser.fullName}</p>
              <p className="text-xs text-stone-500 truncate group-hover:text-stone-400 transition-colors">{currentUser.email}</p>
            </div>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-stone-50/50">
        {/* Mobile Header */}
        <MobileTopHeader user={currentUser} basePath="/dashboard/customer" />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav items={mobileNavItems} themeColor="amber" />
    </div>
  );
}
