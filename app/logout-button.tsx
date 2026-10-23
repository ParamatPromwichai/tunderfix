"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ className, iconOnly }: { className?: string, iconOnly?: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/");
      router.refresh();
      setIsLoading(false);
    }
  }

  return (
    <button
      className={className || "inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-stone-950 px-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400 sm:px-4"}
      disabled={isLoading}
      onClick={handleLogout}
      type="button"
      title="ออกจากระบบ"
    >
      {iconOnly ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      ) : (
        isLoading ? "กำลังออก..." : "ออกจากระบบ"
      )}
    </button>
  );
}
