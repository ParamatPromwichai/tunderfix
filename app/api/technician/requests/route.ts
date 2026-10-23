import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { sendJobRequest } from "@/services/job-requests.service";
import { getJobDetails } from "@/services/jobs.service";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function POST(request: Request) {
  try {
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser || tokenUser.role !== "technician") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const jobId = formData.get("jobId") as string;
    const message = formData.get("message") as string;
    const quotedPrice = formData.get("quotedPrice") ? Number(formData.get("quotedPrice")) : undefined;

    if (!jobId) {
      return NextResponse.redirect(new URL("/dashboard/technician/explore", request.url), 303);
    }

    const [urgent] = await db.execute<RowDataPacket[]>(`SELECT job_id FROM urgent_dispatch WHERE job_id = ?`, [jobId]);
    if (urgent.length) return NextResponse.redirect(new URL("/dashboard/technician/urgent", request.url), 303);

    const job = await getJobDetails(jobId);
    if (!job || job.status !== 'requested') {
      return NextResponse.redirect(new URL("/dashboard/technician/explore", request.url), 303);
    }

    await sendJobRequest({
      jobId,
      technicianId: tokenUser.userId,
      message,
      quotedPrice
    });

    return NextResponse.redirect(new URL(`/dashboard/technician/jobs/${jobId}`, request.url), 303);
  } catch (error: any) {
    console.error("Submit quote error:", error);
    return NextResponse.redirect(new URL("/dashboard/technician/explore", request.url), 303);
  }
}
