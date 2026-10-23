import Link from "next/link";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Minimal design system – same look as the technician ServiceCard   */
/*  white card · ring-stone-200/70 · amber accents · soft hover       */
/* ------------------------------------------------------------------ */

export const cardCls = "ui-card rounded-md bg-white ring-1 ring-stone-200/70";
export const cardHoverCls =
  "ui-card-interactive transition-colors duration-150 hover:ring-stone-400/70";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-md bg-stone-900 text-white text-sm font-semibold transition hover:bg-stone-800";
export const btnSoft =
  "inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-stone-100 text-stone-700 text-sm font-semibold transition hover:bg-stone-200 active:scale-[0.98]";
export const btnAmber =
  "inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-md bg-orange-700 text-white text-sm font-semibold transition hover:bg-orange-800";

export const inputCls =
  "w-full h-11 rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white focus:ring-4 focus:ring-stone-900/5";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="ui-page-header flex items-center justify-between gap-3 px-1">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-black leading-tight text-stone-900 md:text-xl">
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-0.5 text-xs text-stone-500 md:text-sm"
            data-mobile-optional={typeof subtitle === "string" || undefined}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-sm font-bold text-stone-900">{children}</h2>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={`${cardCls} ${hover ? cardHoverCls : ""} ${className}`}>
      {children}
    </div>
  );
}

export function IconTile({
  children,
  tone = "amber",
}: {
  children: ReactNode;
  tone?: "amber" | "stone" | "emerald";
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    stone: "bg-stone-50 text-stone-500 ring-stone-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  };
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-black ring-1 ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className={`${cardCls} p-4`}>
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums text-stone-900">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-stone-400">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ui-empty-state rounded-2xl border border-dashed border-stone-200 bg-white px-6 py-10 text-center">
      {icon && (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-50 text-stone-400 ring-1 ring-stone-100">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-stone-900">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-stone-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const statusMap: Record<string, { label: string; dot: string; text: string }> =
  {
    open: {
      label: "เปิดรับข้อเสนอ",
      dot: "bg-amber-500",
      text: "text-amber-700",
    },
    requested: {
      label: "รอตอบรับ",
      dot: "bg-amber-500",
      text: "text-amber-700",
    },
    pending: {
      label: "รออนุมัติ",
      dot: "bg-amber-500",
      text: "text-amber-700",
    },
    accepted: { label: "นัดหมายแล้ว", dot: "bg-sky-500", text: "text-sky-700" },
    on_the_way: {
      label: "กำลังเดินทาง",
      dot: "bg-violet-500",
      text: "text-violet-700",
    },
    in_progress: {
      label: "กำลังดำเนินงาน",
      dot: "bg-blue-500",
      text: "text-blue-700",
    },
    completed: {
      label: "เสร็จสิ้น",
      dot: "bg-emerald-500",
      text: "text-emerald-700",
    },
    cancelled: { label: "ยกเลิก", dot: "bg-stone-400", text: "text-stone-500" },
    rejected: { label: "ถูกปฏิเสธ", dot: "bg-red-400", text: "text-red-600" },
  };

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const s = statusMap[status] ?? {
    label: status,
    dot: "bg-stone-400",
    text: "text-stone-600",
  };
  return (
    <span
      data-status={status}
      className={`ui-status inline-flex shrink-0 items-center gap-1.5 rounded-full bg-stone-50 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-stone-200/70 ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {label ?? s.label}
    </span>
  );
}

export function MetaRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
      {children}
    </div>
  );
}

export function Meta({
  icon,
  children,
}: {
  icon: "pin" | "money" | "calendar" | "user";
  children: ReactNode;
}) {
  const paths: Record<string, string> = {
    pin: "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
    money:
      "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    calendar:
      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  };
  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <svg
        className="h-3.5 w-3.5 shrink-0 text-stone-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={paths[icon]}
        />
      </svg>
      <span className="truncate">{children}</span>
    </span>
  );
}

export function ChevronLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 hover:text-amber-700"
    >
      {children}
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

export function formatBudget(min?: number | null, max?: number | null) {
  if (!min && !max) return "ประเมินหน้างาน";
  return `฿${(min || 0).toLocaleString()} – ${max ? max.toLocaleString() : "ไม่จำกัด"}`;
}
