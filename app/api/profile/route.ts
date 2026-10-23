import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import { updateUserProfile, updateTechnicianProfile } from "@/services/users.service";

export async function POST(request: Request) {
  try {
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Common fields
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const addressText = formData.get("addressText") as string || "";
    const latitude = formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null;
    const longitude = formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null;
    
    const avatarFile = formData.get("avatarFile") as File | null;
    const removeAvatar = formData.get("removeAvatar") === "true";
    let avatarUrl: string | null | undefined;

    if (removeAvatar) {
      avatarUrl = null;
    } else if (avatarFile && avatarFile.size > 0) {
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const { join } = require('path');
      const { writeFile, mkdir } = require('fs/promises');
      
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {}
      
      const ext = avatarFile.name.split('.').pop() || 'jpg';
      const fileName = `${tokenUser.userId}-${Date.now()}.${ext}`;
      const filePath = join(uploadDir, fileName);
      
      await writeFile(filePath, buffer);
      avatarUrl = `/uploads/avatars/${fileName}`;
    }
    
    await updateUserProfile(tokenUser.userId, { fullName, phone, addressText, latitude, longitude, avatarUrl });

    // Technician specific fields
    if (tokenUser.role === "technician") {
      const bio = formData.get("bio") as string || "";
      const yearsExperience = formData.get("yearsExperience") ? parseInt(formData.get("yearsExperience") as string) : 0;
      const serviceRadiusKm = formData.get("serviceRadiusKm") ? parseFloat(formData.get("serviceRadiusKm") as string) : 50;
      
      await updateTechnicianProfile(tokenUser.userId, { bio, yearsExperience, serviceRadiusKm });
    }

    const redirectUrl = tokenUser.role === "technician" ? "/dashboard/technician/profile?success=true" : "/dashboard/customer/profile?success=true";
    return NextResponse.redirect(new URL(redirectUrl, request.url), 303);
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
