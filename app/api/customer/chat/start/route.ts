import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getOrCreateRoom } from "@/services/chat.service";

export async function POST(request: Request) {
  try {
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser) return NextResponse.redirect(new URL("/login", request.url), 303);

    const formData = await request.formData();
    const jobId = formData.get("jobId") as string;
    const technicianId = formData.get("technicianId") as string;

    if (!jobId || !technicianId) {
       return NextResponse.redirect(new URL("/dashboard/customer", request.url), 303);
    }

    const roomId = await getOrCreateRoom(jobId, tokenUser.userId, technicianId);

    return NextResponse.redirect(new URL(`/dashboard/customer/chat/${roomId}`, request.url), 303);
  } catch (error) {
    console.error("Start chat error:", error);
    return NextResponse.redirect(new URL("/dashboard/customer", request.url), 303);
  }
}
