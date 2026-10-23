import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { updateStatus, getJobDetails } from "@/services/jobs.service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser) return NextResponse.redirect(new URL("/login", request.url));

    const job = await getJobDetails(id);
    if (!job || job.customerId !== tokenUser.userId) {
      return NextResponse.redirect(new URL("/dashboard/customer", request.url));
    }

    await updateStatus(id, 'completed');

    return NextResponse.redirect(new URL(`/dashboard/customer/jobs/${id}`, request.url), 303);
  } catch (error) {
    console.error("Complete job error:", error);
    return NextResponse.redirect(new URL("/dashboard/customer", request.url), 303);
  }
}
