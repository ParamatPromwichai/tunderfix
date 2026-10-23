import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { submitReview } from "@/services/reviews.service";
import { getJobDetails } from "@/services/jobs.service";

export async function POST(request: Request) {
  try {
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { jobId, rating, comment } = body;

    if (!jobId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const job = await getJobDetails(jobId);
    if (!job || job.customerId !== tokenUser.userId || !job.technicianId) {
      return NextResponse.json({ error: "Invalid job or unauthorized" }, { status: 403 });
    }
    
    // Only allow reviewing completed jobs
    if (job.status !== 'completed') {
      return NextResponse.json({ error: "Job is not completed yet" }, { status: 400 });
    }

    await submitReview({
      jobId,
      customerId: tokenUser.userId,
      technicianId: job.technicianId,
      rating: Number(rating),
      comment
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Note: will error if review already exists due to UNIQUE constraint, which is fine
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
