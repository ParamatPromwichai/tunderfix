"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/app/logout-button";

interface MobileTopHeaderProps {
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  basePath: string;
}

export function MobileTopHeader({ user, basePath }: MobileTopHeaderProps) {
  const pathname = usePathname();
  
  // Only show the header on the exact base path (the Home page)
  if (pathname !== basePath) {
    return null;
  }

  return (
    <header className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-stone-200 shrink-0 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 font-black text-white shadow-md shadow-amber-500/20">TF</div>
        <span className="font-extrabold text-stone-900 tracking-tight">ThunderFix</span>
      </div>
      <div className="flex items-center gap-3">
        <Link href={`${basePath}/profile`} className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700 cursor-pointer hover:ring-2 hover:ring-amber-500/50 transition-all overflow-hidden border border-stone-200 shadow-sm">
           <img 
             src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}&backgroundColor=e7e5e4&textColor=44403c`}
             alt="Profile"
             className="w-full h-full object-cover"
           />
        </Link>
        <LogoutButton 
          iconOnly 
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-stone-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all border border-stone-200 shadow-sm"
        />
      </div>
    </header>
  );
}
