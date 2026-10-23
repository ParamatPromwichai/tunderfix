import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { removeService } from "@/services/technician-services.service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser || tokenUser.role !== 'technician') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await removeService(id, tokenUser.userId);

    return NextResponse.redirect(new URL("/dashboard/technician/services", request.url), 303);
  } catch (error: any) {
    console.error("Delete service error:", error);
    return NextResponse.redirect(new URL("/dashboard/technician/services", request.url), 303);
  }
}
