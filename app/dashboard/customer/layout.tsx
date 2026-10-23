import { redirect } from "next/navigation";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getActiveUserById } from "@/services/auth.service";
import { getNavBadges } from "@/services/badges.service";
import { DashboardShell } from "@/components/DashboardShell";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAuthUserFromCookies();
  if (!token) redirect("/login");
  const user = await getActiveUserById(token.userId);
  if (!user || user.role !== "customer") redirect("/login");
  const badges = await getNavBadges(user.id, user.role);
  return (
    <DashboardShell
      role="customer"
      name={user.fullName}
      avatarUrl={user.avatarUrl}
      unread={badges.unreadMessages}
    >
      {children}
    </DashboardShell>
  );
}
