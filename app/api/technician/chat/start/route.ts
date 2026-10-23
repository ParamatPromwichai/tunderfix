import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getOrCreateRoom } from "@/services/chat.service";

export async function POST(request: Request) {
  try {
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser) return NextResponse.redirect(new URL("/login", request.url), 303);

    const formData = await request.formData();
    const jobId = formData.get("jobId") as string;
    const customerId = formData.get("customerId") as string;
    if (!jobId || !customerId) {
       return NextResponse.redirect(new URL("/dashboard/technician", request.url), 303);
    }

    const roomId = await getOrCreateRoom(jobId, customerId, tokenUser.userId);

    return NextResponse.redirect(new URL(`/dashboard/technician/chat/${roomId}`, request.url), 303);
  } catch (error) {
    console.error("Start chat error:", error);
    return NextResponse.redirect(new URL("/dashboard/technician", request.url), 303);
  }
}
