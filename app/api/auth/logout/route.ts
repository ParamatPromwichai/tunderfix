import { clearAuthCookie } from "@/lib/auth";
import { successResponse } from "@/lib/response";

export const runtime = "nodejs";

export async function POST() {
  const response = successResponse({ message: "Logged out successfully" });

  clearAuthCookie(response);

  return response;
}
