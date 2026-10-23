export const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
export const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export const AVATAR_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export type AvatarType = keyof typeof AVATAR_TYPES;
export type AvatarFileError = "avatar-type" | "avatar-size";

export function validateAvatarFile(file: {
  type: string;
  size: number;
}): AvatarFileError | null {
  if (!Object.hasOwn(AVATAR_TYPES, file.type)) return "avatar-type";
  if (file.size <= 0 || file.size > MAX_AVATAR_BYTES) return "avatar-size";
  return null;
}

export function detectAvatarType(bytes: Uint8Array): AvatarType | null {
  const startsWith = (signature: number[]) =>
    signature.every((byte, index) => bytes[index] === byte);
  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return "image/png";
  const text = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  if (text(0, 6) === "GIF87a" || text(0, 6) === "GIF89a") return "image/gif";
  if (text(0, 4) === "RIFF" && text(8, 12) === "WEBP") return "image/webp";
  return null;
}
