"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MobileSidebarAutoClose() {
  const pathname = usePathname();

  useEffect(() => {
    const checkbox = document.getElementById("mobile-menu-toggle") as HTMLInputElement;
    if (checkbox && checkbox.checked) {
      checkbox.checked = false;
    }
  }, [pathname]);

  return null;
}
