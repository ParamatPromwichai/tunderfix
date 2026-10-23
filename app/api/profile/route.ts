import { NextResponse } from "next/server";
import { getAuthUserFromCookies } from "@/lib/auth";
import {
  AvatarUploadError,
  deleteAvatar,
  uploadAvatar,
} from "@/lib/avatar-storage";
import {
  getUserProfile,
  updateUserProfile,
  updateTechnicianProfile,
} from "@/services/users.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let profilePath = "/dashboard/customer/profile";
  try {
    const tokenUser = await getAuthUserFromCookies();
    if (!tokenUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    profilePath =
      tokenUser.role === "technician"
        ? "/dashboard/technician/profile"
        : "/dashboard/customer/profile";
    const previousProfile = await getUserProfile(tokenUser.userId);
    if (!previousProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();

    // Common fields
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const addressText = (formData.get("addressText") as string) || "";
    const latitude = formData.get("latitude")
      ? parseFloat(formData.get("latitude") as string)
      : null;
    const longitude = formData.get("longitude")
      ? parseFloat(formData.get("longitude") as string)
      : null;

    const avatarFile = formData.get("avatarFile");
    const removeAvatar = formData.get("removeAvatar") === "true";
    let avatarUrl: string | null | undefined;

    if (removeAvatar) {
      avatarUrl = null;
    } else if (avatarFile instanceof File && avatarFile.size > 0) {
      avatarUrl = await uploadAvatar(tokenUser.userId, avatarFile);
    }

    await updateUserProfile(tokenUser.userId, {
      fullName,
      phone,
      addressText,
      latitude,
      longitude,
      avatarUrl,
    });

    if (avatarUrl !== undefined && previousProfile.avatarUrl !== avatarUrl) {
      await deleteAvatar(previousProfile.avatarUrl, tokenUser.userId).catch(
        () => {
          console.warn(
            "Profile saved, but the previous avatar could not be removed from Blob.",
          );
        },
      );
    }

    // Technician specific fields
    if (tokenUser.role === "technician") {
      const bio = (formData.get("bio") as string) || "";
      const yearsExperience = formData.get("yearsExperience")
        ? parseInt(formData.get("yearsExperience") as string)
        : 0;
      const serviceRadiusKm = formData.get("serviceRadiusKm")
        ? parseFloat(formData.get("serviceRadiusKm") as string)
        : 50;

      await updateTechnicianProfile(tokenUser.userId, {
        bio,
        yearsExperience,
        serviceRadiusKm,
      });
    }

    return NextResponse.redirect(
      new URL(`${profilePath}?success=true`, request.url),
      303,
    );
  } catch (error) {
    const code =
      error instanceof AvatarUploadError ? error.code : "profile-save";
    console.error("Update profile failed:", code);
    return NextResponse.redirect(
      new URL(`${profilePath}?error=${code}`, request.url),
      303,
    );
  }
}
