"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Home, 
  Search, 
  Briefcase, 
  MessageSquare, 
  Bell, 
  Plus, 
  Wrench,
  User,
  Settings
} from "lucide-react";

const iconMap: Record<string, any> = {
  Home,
  Search,
  Briefcase,
  MessageSquare,
  Plus,
  Wrench,
  Settings,
};

import { useState, useRef, useEffect } from "react";

export type NavItem = {
  name: string;
  href: string;
  iconName: keyof typeof iconMap;
  isAction?: boolean;
  badge?: number;
  subItems?: { name: string; href: string; badge?: number; iconName?: keyof typeof iconMap }[];
};

interface MobileBottomNavProps {
  items: NavItem[];
  themeColor: "emerald" | "sky" | "amber";
}

export function MobileBottomNav({ items, themeColor }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const activeColor = themeColor === "emerald" ? "text-emerald-600" : themeColor === "amber" ? "text-amber-600" : "text-sky-600";
  const actionBgColor = themeColor === "emerald" ? "bg-emerald-600 hover:bg-emerald-700" : themeColor === "amber" ? "bg-amber-500 hover:bg-amber-600" : "bg-sky-600 hover:bg-sky-700";

  // Close dropdown when clicking outside or navigating
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  // Check if current page is one of the direct targets of the navbar buttons
  const isDirectNavTarget = items.some(item => {
    if (pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some(sub => pathname === sub.href);
    }
    return false;
  });

  if (!isDirectNavTarget) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <nav className="flex justify-around items-center h-16 px-2 relative">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard/customer" && item.href !== "/dashboard/technician" && pathname.startsWith(item.href));
          const Icon = iconMap[item.iconName];

          if (item.isAction) {
            return (
              <div key={item.name} className="relative -top-5">
                <Link href={item.href}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg ${actionBgColor}`}
                  >
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </motion.div>
                </Link>
                {!!item.badge && item.badge > 0 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white translate-x-1 -translate-y-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>
            );
          }

          if (item.subItems && item.subItems.length > 0) {
            const hasActiveSub = item.subItems.some(sub => pathname.startsWith(sub.href));
            const totalBadge = item.subItems.reduce((acc, sub) => acc + (sub.badge || 0), 0) + (item.badge || 0);
            const isOpen = openDropdown === item.name;

            return (
              <div 
                key={item.name} 
                className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative cursor-pointer"
                onClick={() => setOpenDropdown(isOpen ? null : item.name)}
              >
                {isOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-stone-900/10 backdrop-blur-[1px] transition-all" onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }} />
                    <div className="absolute bottom-[20px] left-1/2 z-50 flex items-center justify-center">
                      {item.subItems.map((sub, i) => {
                        const isSubActive = pathname.startsWith(sub.href);
                        // Fan out at -45 and 45 degrees if there are 2 items.
                        const angle = item.subItems!.length === 2 ? (i === 0 ? -50 : 50) : 0; 
                        const radius = 80; // Distance from the main button
                        const x = Math.sin((angle * Math.PI) / 180) * radius;
                        const y = -Math.cos((angle * Math.PI) / 180) * radius;
                        const SubIcon = sub.iconName ? iconMap[sub.iconName] : iconMap[item.iconName];

                        return (
                          <motion.div
                            key={sub.name}
                            initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                            animate={{ opacity: 1, x, y, scale: 1 }}
                            exit={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link 
                              href={sub.href} 
                              onClick={() => setOpenDropdown(null)}
                              className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                            >
                              <div className={`w-14 h-14 rounded-full shadow-lg border border-stone-100 flex items-center justify-center relative ${isSubActive ? (themeColor === "emerald" ? "bg-emerald-600 text-white" : themeColor === "amber" ? "bg-amber-500 text-stone-900" : "bg-sky-600 text-white") : "bg-white text-stone-700 hover:bg-stone-50"}`}>
                                <SubIcon className="w-6 h-6" />
                                {!!sub.badge && sub.badge > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                                    {sub.badge > 99 ? '99+' : sub.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-bold text-stone-700 bg-white/90 px-3 py-1 rounded-full shadow-sm text-center whitespace-nowrap">
                                {sub.name}
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                )}
                
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative flex items-center justify-center w-12 h-8 rounded-full ${(isActive || hasActiveSub) ? (themeColor === "emerald" ? "bg-emerald-100" : themeColor === "amber" ? "bg-amber-100" : "bg-sky-100") : "bg-transparent"}`}
                >
                  <Icon 
                    className={`w-5 h-5 transition-colors ${(isActive || hasActiveSub) ? activeColor : "text-stone-500"}`} 
                    strokeWidth={(isActive || hasActiveSub) ? 2.5 : 2} 
                  />
                  {totalBadge > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                      {totalBadge > 99 ? '99+' : totalBadge}
                    </div>
                  )}
                </motion.div>
                <span className={`text-[10px] font-medium transition-colors ${(isActive || hasActiveSub) ? activeColor : "text-stone-500"}`}>
                  {item.name}
                </span>
              </div>
            );
          }

          return (
            <Link key={item.name} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative flex items-center justify-center w-12 h-8 rounded-full ${isActive ? (themeColor === "emerald" ? "bg-emerald-100" : themeColor === "amber" ? "bg-amber-100" : "bg-sky-100") : "bg-transparent"}`}
              >
                <Icon 
                  className={`w-5 h-5 transition-colors ${isActive ? activeColor : "text-stone-500"}`} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                {!!item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </motion.div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? activeColor : "text-stone-500"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
