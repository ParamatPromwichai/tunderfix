import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";
import {
  getAvatarAccess,
  getAvatarUrl,
  getPrivateAvatarPath,
} from "@/lib/avatar-config.mjs";

import {
  AVATAR_TYPES,
  detectAvatarType,
  validateAvatarFile,
  type AvatarFileError,
} from "@/lib/avatar-file";

export class AvatarUploadError extends Error {
  constructor(readonly code: AvatarFileError | "avatar-upload") {
    super(code);
  }
}

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<string> {
  const validationError = validateAvatarFile(file);
  if (validationError) throw new AvatarUploadError(validationError);

  const bytes = Buffer.from(await file.arrayBuffer());
  const type = detectAvatarType(bytes);
  if (!type || type !== file.type) throw new AvatarUploadError("avatar-type");

  try {
    const access = getAvatarAccess();
    const blob = await put(
      `avatars/${userId}/${randomUUID()}.${AVATAR_TYPES[type]}`,
      bytes,
      {
        access,
        contentType: type,
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      },
    );
    return getAvatarUrl(blob, access);
  } catch {
    throw new AvatarUploadError("avatar-upload");
  }
}

// Only delete app-managed files belonging to this account, after the DB is saved.
export async function deleteAvatar(
  url: string | null,
  userId: string,
): Promise<void> {
  if (!url) return;
  const privatePath = getPrivateAvatarPath(url, userId);
  if (privatePath) {
    await del(privatePath, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return;
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return; // Local avatars and external image URLs are left intact.
  }
  if (
    parsed.protocol !== "https:" ||
    !parsed.hostname.endsWith(".public.blob.vercel-storage.com") ||
    !parsed.pathname.startsWith(`/avatars/${userId}/`)
  )
    return;

  await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
}
