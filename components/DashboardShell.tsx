"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  BriefcaseBusiness,
  MessageSquare,
  Wrench,
  UserRound,
  ArrowUpRight,
  Zap,
  Menu,
  X,
  Plus,
  Bell,
} from "lucide-react";
import { Brand } from "@/components/Brand";
import { LogoutButton } from "@/app/logout-button";
import { DispatchProvider } from "@/components/DispatchProvider";

function ProfileAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const source = avatarUrl?.trim();
  if (!source || failedUrl === source)
    return <>{Array.from(name.trim())[0] || "?"}</>;
  return (
    <img
      src={source}
      alt=""
      width={34}
      height={34}
      className="dashboard-avatar-image"
      onError={() => setFailedUrl(source)}
    />
  );
}

export function DashboardShell({
  role,
  name,
  avatarUrl,
  unread,
  children,
}: {
  role: "customer" | "technician";
  name: string;
  avatarUrl?: string | null;
  unread: number;
  children: ReactNode;
}) {
  const base = `/dashboard/${role}`;
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [menu]);
  const customer = role === "customer";
  const section = path.slice(base.length).split("/").filter(Boolean);
  const view = !section.length
    ? "overview"
    : section[0] === "jobs"
      ? section[1] === "new"
        ? "new-job"
        : section[2] === "review"
          ? "review"
          : section[1]
            ? "job-detail"
            : "jobs"
      : section[0] === "chat" && section[1]
        ? "chat-room"
        : section[0];
  const titles: Record<string, string> = {
    overview: "ภาพรวมของคุณ",
    explore: customer ? "ค้นหาช่างที่ใช่" : "พบงานถัดไปของคุณ",
    jobs: "ติดตามทุกงานในที่เดียว",
    "new-job": "เริ่มต้นงานซ่อม",
    "job-detail": "รายละเอียดและความคืบหน้า",
    review: "แบ่งปันประสบการณ์",
    profile: "ข้อมูลและพื้นที่ของคุณ",
    chat: "ทุกบทสนทนาของงาน",
    "chat-room": "คุยรายละเอียดให้ตรงกัน",
    services: "บริการจากฝีมือของคุณ",
    requests: "คำขอจากลูกค้า",
    urgent: "เชื่อมต่อช่างและงานใกล้ตัว",
  };
  const items = [
    { href: base, name: "ภาพรวม", icon: Home },
    {
      href: `${base}/urgent`,
      name: customer ? "เรียกช่างด่วน" : "งานด่วนใกล้ฉัน",
      icon: Zap,
    },
    {
      href: `${base}/explore`,
      name: customer ? "ค้นหาช่าง" : "ค้นหางาน",
      icon: Search,
    },
    {
      href: `${base}/jobs`,
      name: customer ? "งานซ่อมของฉัน" : "งานที่รับแล้ว",
      icon: BriefcaseBusiness,
    },
    ...(!customer
      ? [
          { href: `${base}/requests`, name: "คำขอเรียกช่าง", icon: Bell },
          { href: `${base}/services`, name: "บริการและราคา", icon: Wrench },
        ]
      : []),
    { href: `${base}/chat`, name: "ข้อความ", icon: MessageSquare },
    { href: `${base}/profile`, name: "โปรไฟล์และพื้นที่", icon: UserRound },
  ];
  const active = (href: string) =>
    href === base
      ? path === href
      : path === href || path.startsWith(`${href}/`);
  return (
    <DispatchProvider role={role}>
      <div
        className={`dashboard-shell ${path === base ? "is-overview" : ""}`}
        data-view={view}
        data-role={role}
      >
        <a className="skip-link" href="#workspace">
          ข้ามไปเนื้อหา
        </a>
        {menu && (
          <button
            className="sidebar-scrim"
            aria-label="ปิดเมนู"
            onClick={() => setMenu(false)}
          />
        )}
        <aside className={`workspace-sidebar ${menu ? "is-open" : ""}`}>
          <div className="sidebar-brand">
            <Brand />
            <button
              className="mobile-only icon-button"
              aria-label="ปิดเมนู"
              onClick={() => setMenu(false)}
            >
              <X />
            </button>
          </div>
          <p className="sidebar-label">
            {customer ? "พื้นที่ของคุณ" : "พื้นที่สำหรับช่าง"}
          </p>
          <nav aria-label="เมนูหลัก">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenu(false)}
                aria-current={active(item.href) ? "page" : undefined}
                className={`side-link ${active(item.href) ? "active" : ""} ${item.icon === Zap ? "urgent-link" : ""}`}
              >
                <item.icon size={19} />
                <span>{item.name}</span>
                {item.icon === MessageSquare && unread > 0 && (
                  <span className="nav-count">{unread}</span>
                )}
              </Link>
            ))}
          </nav>
          <div className="sidebar-tip">
            <span className="eyebrow">
              THUNDERFIX {customer ? "FOR YOU" : "PARTNER"}
            </span>
            <strong>
              {customer ? "เรื่องซ่อม ไม่ต้องรอ" : "งานใกล้บ้าน เดินทางน้อยลง"}
            </strong>
            <p>
              {customer
                ? "ประกาศครั้งเดียว ให้ช่างใกล้คุณส่งข้อเสนอ"
                : "เปิดรับงานด่วน เพื่อเห็นงานที่ตรงกับบริการของคุณ"}
            </p>
            <Link href={`${base}/urgent`}>
              {customer ? "ลองเรียกด่วน" : "เปิดรับงานด่วน"}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="sidebar-user">
            <span className="initial-avatar" aria-hidden="true">
              <ProfileAvatar name={name} avatarUrl={avatarUrl} />
            </span>
            <div>
              <strong>{name}</strong>
              <small>{customer ? "บัญชีลูกค้า" : "พาร์ทเนอร์ช่าง"}</small>
            </div>
            <LogoutButton className="logout-small" />
          </div>
        </aside>
        <div className="workspace-body">
          <header className="workspace-topbar">
            <div className="flex items-center gap-3">
              <button
                className="mobile-only icon-button"
                onClick={() => setMenu(true)}
                aria-label="เปิดเมนู"
                aria-expanded={menu}
              >
                <Menu size={22} />
              </button>
              <span className="desktop-only topbar-caption">
                <span className="context-dot" />
                {titles[view] || "ThunderFix"}
              </span>
              <span className="mobile-only">
                <Brand compact />
              </span>
              <span className="mobile-role-label">
                {customer ? "สำหรับคุณ" : "พาร์ทเนอร์"}
              </span>
            </div>
            <div className="topbar-actions">
              {customer && (
                <Link
                  className="text-link desktop-only"
                  href={`${base}/jobs/new`}
                >
                  <Plus size={16} /> ลงประกาศนัดหมาย
                </Link>
              )}
              <Link
                href={`${base}/chat`}
                className="icon-button"
                aria-label={`ข้อความใหม่ ${unread} ข้อความ`}
              >
                <MessageSquare size={20} />
                {unread > 0 && <span className="unread-dot" />}
              </Link>
              <Link
                href={`${base}/profile`}
                className="initial-avatar"
                aria-label="โปรไฟล์ของฉัน"
              >
                <ProfileAvatar name={name} avatarUrl={avatarUrl} />
              </Link>
            </div>
          </header>
          <main id="workspace" className="workspace-content">
            <div className="route-surface" key={path}>
              {children}
            </div>
          </main>
        </div>
        <nav className="workspace-bottomnav" aria-label="เมนูมือถือ">
          {[
            items[0],
            items[2],
            items[1],
            items[3],
            items.find((i) => i.icon === MessageSquare)!,
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${active(item.href) ? "active" : ""} ${item.icon === Zap ? "bottom-urgent" : ""}`}
              aria-current={active(item.href) ? "page" : undefined}
            >
              <span className="dock-icon">
                <item.icon size={21} />
                {item.icon === MessageSquare && unread > 0 && (
                  <span className="dock-badge">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </span>
              <span>
                {item.icon === Zap
                  ? customer
                    ? "เรียกด่วน"
                    : "งานด่วน"
                  : item.icon === BriefcaseBusiness
                    ? "งานของฉัน"
                    : item.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </DispatchProvider>
  );
}
