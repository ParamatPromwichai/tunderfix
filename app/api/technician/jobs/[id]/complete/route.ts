import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getJobDetails, updateStatus, setFinalPrice } from "@/services/jobs.service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser || tokenUser.role !== 'technician') {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const job = await getJobDetails(id);
    if (!job || job.technicianId !== tokenUser.userId) {
      return NextResponse.redirect(new URL("/dashboard/technician", request.url));
    }

    const formData = await request.formData();
    const finalPriceStr = formData.get("finalPrice") as string;
    const finalPrice = finalPriceStr ? Number(finalPriceStr) : null;

    if (finalPrice !== null && !isNaN(finalPrice)) {
      await setFinalPrice(id, finalPrice);
    }
    
    await updateStatus(id, "completed");

    return NextResponse.redirect(new URL(`/dashboard/technician/jobs/${id}`, request.url), 303);
  } catch (error) {
    console.error("Complete job error:", error);
    return NextResponse.redirect(new URL("/dashboard/technician", request.url), 303);
  }
}
