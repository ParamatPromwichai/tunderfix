import Link from "next/link";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getActiveUserById } from "@/services/auth.service";
import { getNavBadges } from "@/services/badges.service";
import { LogoutButton } from "@/app/logout-button";
import { redirect } from "next/navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileTopHeader } from "@/components/MobileTopHeader";
import { Home, Search, Briefcase, MessageSquare, Wrench, Settings } from "lucide-react";

// Force hot reload
export const dynamic = "force-dynamic";

export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tokenUser = await getAuthUserFromCookies();
  if (!tokenUser) redirect("/login");

  const currentUser = await getActiveUserById(tokenUser.userId);
  if (!currentUser || currentUser.role !== "technician") {
    redirect("/login");
  }

  const badges = await getNavBadges(currentUser.id, currentUser.role);

  const mobileNavItems = [
    { name: "ภาพรวม", href: "/dashboard/technician", iconName: "Home" as const },
    { name: "ตลาดงาน", href: "/dashboard/technician/explore", iconName: "Search" as const },
    { 
      name: "งานซ่อม", 
      href: "/dashboard/technician/jobs", 
      iconName: "Briefcase" as const, 
      subItems: [
        { name: "คำขอเรียกช่าง", href: "/dashboard/technician/requests", badge: badges.pendingRequests, iconName: "MessageSquare" as const },
        { name: "งานของฉัน", href: "/dashboard/technician/jobs", iconName: "Briefcase" as const }
      ]
    },
    { name: "บริการ", href: "/dashboard/technician/services", iconName: "Wrench" as const },
    { name: "แชท", href: "/dashboard/technician/chat", iconName: "MessageSquare" as const, badge: badges.unreadMessages },
  ];

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-900 font-sans relative pb-16 md:pb-0 animate-in fade-in duration-700">
      
      {/* Sidebar for Desktop */}
      <aside className="w-64 bg-stone-950 text-stone-300 flex-col shrink-0 hidden md:flex h-screen sticky top-0 border-r border-stone-800 shadow-xl shadow-amber-900/10 z-50">
        <div className="p-6 flex items-center gap-3 border-b border-stone-800/50 bg-stone-900/30 backdrop-blur-sm">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-lg font-bold text-stone-950 shadow-lg shadow-amber-500/30 ring-1 ring-amber-400/50 group-hover:rotate-12 transition-transform duration-300">
            TF
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide">ThunderFix</h1>
            <p className="text-xs text-amber-400 font-medium">Technician Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/dashboard/technician" className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 transition-all duration-300 border border-transparent hover:border-amber-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span className="font-medium">ภาพรวมงาน</span>
          </Link>
          <Link href="/dashboard/technician/explore" className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 transition-all duration-300 border border-transparent hover:border-amber-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <span className="font-medium">ตลาดงานใหม่</span>
          </Link>
          <Link href="/dashboard/technician/requests" className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 transition-all duration-300 border border-transparent hover:border-amber-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
            <span className="font-medium">คำขอเรียกช่างโดยตรง</span>
            {badges.pendingRequests > 0 && <span className="ml-auto bg-amber-500 text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm shadow-amber-500/50 animate-pulse">{badges.pendingRequests}</span>}
          </Link>
          <Link href="/dashboard/technician/jobs" className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 transition-all duration-300 border border-transparent hover:border-amber-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            <span className="font-medium">งานของฉัน</span>
          </Link>
          <Link href="/dashboard/technician/services" className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 transition-all duration-300 border border-transparent hover:border-amber-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span className="font-medium">ตั้งค่าบริการ/ราคา</span>
          </Link>
          <div className="pt-6 pb-2">
            <p className="px-3 text-[10px] font-bold text-stone-600 uppercase tracking-widest">การสื่อสาร</p>
          </div>
          <Link href="/dashboard/technician/chat" className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 transition-all duration-300 border border-transparent hover:border-amber-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <span className="font-medium">ข้อความแชท</span>
            {badges.unreadMessages > 0 && <span className="ml-auto bg-amber-500 text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm shadow-amber-500/50 animate-pulse">{badges.unreadMessages}</span>}
          </Link>
        </nav>
        
        <div className="p-4 border-t border-stone-800/50 bg-stone-900/30">
          <Link href="/dashboard/technician/profile" className="group flex items-center gap-3 mb-4 p-2.5 -mx-2 rounded-xl hover:bg-stone-800 transition cursor-pointer border border-transparent hover:border-stone-700">
            <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center font-bold text-stone-200 shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-amber-500 transition-all">
              <img 
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName)}&backgroundColor=f59e0b&textColor=ffffff`}
                alt="Profile"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">{currentUser.fullName}</p>
              <p className="text-xs text-stone-400 truncate">ช่างซ่อมประจำระบบ</p>
            </div>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-stone-50/50">
        {/* Mobile Header */}
        <MobileTopHeader user={currentUser} basePath="/dashboard/technician" />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-700">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav items={mobileNavItems} themeColor="amber" />
    </div>
  );
}
