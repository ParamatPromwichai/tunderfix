import { redirect } from "next/navigation";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getActiveUserById } from "@/services/auth.service";

export const dynamic = "force-dynamic";

export default async function LaunchPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const { action } = await searchParams;
  const section =
    action && ["urgent", "jobs", "chat"].includes(action) ? `/${action}` : "";
  const loginUrl = `/login?next=${encodeURIComponent(`/launch${section ? `?action=${action}` : ""}`)}`;
  const token = await getAuthUserFromCookies();
  if (!token) redirect(loginUrl);
  const user = await getActiveUserById(token.userId);
  if (!user) redirect(loginUrl);
  if (user.role !== "customer" && user.role !== "technician") redirect("/");
  redirect(`/dashboard/${user.role}${section}`);
}
