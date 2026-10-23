import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { updateServicePricing } from "@/services/technician-services.service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser || tokenUser.role !== "technician") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const priceMin = formData.get("priceMin") ? Number(formData.get("priceMin")) : null;
    const priceMax = formData.get("priceMax") ? Number(formData.get("priceMax")) : null;
    const experienceYears = formData.get("experienceYears") ? Number(formData.get("experienceYears")) : null;
    const description = formData.get("description") as string | null;

    await updateServicePricing(id, tokenUser.userId, {
      priceMin,
      priceMax,
      experienceYears,
      description
    });

    return NextResponse.redirect(new URL("/dashboard/technician/services", request.url), 303);
  } catch (error: any) {
    console.error("Update service error:", error);
    return NextResponse.redirect(new URL("/dashboard/technician/services", request.url), 303);
  }
}