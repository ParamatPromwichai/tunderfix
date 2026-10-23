import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { createNewJob } from "@/services/jobs.service";

export async function POST(request: Request) {
  try {
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // basic validation
    if (!body.categoryId || !body.title || !body.description || !body.addressText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const jobId = await createNewJob({
      customerId: tokenUser.userId,
      categoryId: body.categoryId,
      title: body.title,
      description: body.description,
      addressText: body.addressText,
      technicianId: body.technicianId,
      latitude: body.latitude || 0,
      longitude: body.longitude || 0,
      budgetMin: body.budgetMin,
      budgetMax: body.budgetMax,
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime,
    });

    return NextResponse.json({ success: true, jobId });
  } catch (error: any) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: error.message || "Failed to create job" }, { status: 500 });
  }
}
