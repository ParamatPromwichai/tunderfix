import { get } from "@vercel/blob";
import { getAuthUserFromCookies } from "@/lib/auth";
import { getPrivateAvatarPath } from "@/lib/avatar-config.mjs";
import { AVATAR_TYPES } from "@/lib/avatar-file";
import { getUserProfile } from "@/services/users.service";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string; fileName: string }> },
) {
  const noStore = { "Cache-Control": "private, no-store" };
  try {
    if (!(await getAuthUserFromCookies())) {
      return new Response(null, { status: 401, headers: noStore });
    }
    const { userId, fileName } = await params;
    const avatarUrl = `/api/avatars/${userId}/${fileName}`;
    const pathname = getPrivateAvatarPath(avatarUrl, userId);
    if (!pathname) return new Response(null, { status: 404, headers: noStore });

    // Only the account's current photo is visible; orphaned/replaced files aren't.
    const profile = await getUserProfile(userId);
    if (!profile || profile.avatarUrl !== avatarUrl) {
      return new Response(null, { status: 404, headers: noStore });
    }
    const result = await get(pathname, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    });
    if (!result) return new Response(null, { status: 404, headers: noStore });
    const headers = {
      "Cache-Control": "private, no-cache",
      Vary: "Cookie",
      ETag: result.blob.etag,
      "X-Content-Type-Options": "nosniff",
    };
    if (result.statusCode === 304) {
      return new Response(null, { status: 304, headers });
    }
    if (!Object.hasOwn(AVATAR_TYPES, result.blob.contentType)) {
      await result.stream.cancel();
      return new Response(null, { status: 404, headers: noStore });
    }
    return new Response(result.stream, {
      headers: {
        ...headers,
        "Content-Type": result.blob.contentType,
        "Content-Length": String(result.blob.size),
        "Content-Disposition": "inline",
      },
    });
  } catch {
    console.error("Could not load profile image from Blob.");
    return new Response(null, { status: 503, headers: noStore });
  }
}
