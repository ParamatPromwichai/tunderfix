import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { addService } from "@/services/technician-services.service";

export async function POST(request: Request) {
  try {
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser || tokenUser.role !== 'technician') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const categoryId = formData.get("categoryId") as string;
    const priceMin = formData.get("priceMin") ? Number(formData.get("priceMin")) : undefined;
    const priceMax = formData.get("priceMax") ? Number(formData.get("priceMax")) : undefined;
    const experienceYears = formData.get("experienceYears") ? Number(formData.get("experienceYears")) : undefined;
    const description = formData.get("description") as string | undefined;

    if (!categoryId) {
      return NextResponse.redirect(new URL("/dashboard/technician/services", request.url), 303);
    }

    await addService({
      technicianId: tokenUser.userId,
      categoryId,
      priceMin,
      priceMax,
      experienceYears,
      description
    });

    return NextResponse.redirect(new URL("/dashboard/technician/services", request.url), 303);
  } catch (error: any) {
    console.error("Add service error:", error);
    return NextResponse.redirect(new URL("/dashboard/technician/services", request.url), 303);
  }
}
