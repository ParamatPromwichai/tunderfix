import { NextResponse } from "next/server";
import { getActiveCategories, createCategory } from "@/services/categories.service";

export async function GET() {
  try {
    const categories = await getActiveCategories();
    return NextResponse.json({ data: categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name || name.trim() === "") {
      return NextResponse.redirect(new URL("/dashboard/technician/services?error=NameRequired", request.url), 303);
    }

    try {
      await createCategory(name.trim(), description ? description.trim() : undefined);
    } catch (dbError: any) {
      if (dbError.code === 'ER_DUP_ENTRY') {
        return NextResponse.redirect(new URL("/dashboard/technician/services?error=CategoryExists", request.url), 303);
      }
      throw dbError;
    }
    
    return NextResponse.redirect(new URL("/dashboard/technician/services?success=CategoryAdded", request.url), 303);
  } catch (error: any) {
    return NextResponse.redirect(new URL("/dashboard/technician/services?error=Failed", request.url), 303);
  }
}
