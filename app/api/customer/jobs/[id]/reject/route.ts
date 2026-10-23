import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { rejectRequest } from "@/services/job-requests.service";
import { getJobDetails, updateStatus } from "@/services/jobs.service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser) return NextResponse.redirect(new URL("/login", request.url));

    const job = await getJobDetails(id);
    if (!job || job.customerId !== tokenUser.userId) {
      return NextResponse.redirect(new URL("/dashboard/customer", request.url));
    }

    const formData = await request.formData();
    const requestId = formData.get("requestId") as string;

    if (requestId) {
      await rejectRequest(requestId);
      
      // If this was a targeted job (directed to a specific technician), 
      // rejecting their offer means the job should be cancelled immediately
      if (job.technicianId) {
        await updateStatus(id, "cancelled");
      }
    }

    return NextResponse.redirect(new URL(`/dashboard/customer/jobs/${id}`, request.url));
  } catch (error) {
    console.error("Reject request error:", error);
    return NextResponse.redirect(new URL("/dashboard/customer", request.url));
  }
}
