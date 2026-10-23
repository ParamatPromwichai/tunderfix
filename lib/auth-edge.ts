import { getServerEnv, type UserRole } from "@/lib/validations";

export interface EdgeAuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

const AUTH_ROLES = new Set<UserRole>(["customer", "technician", "admin"]);

function decodeBase64Url(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer as ArrayBuffer;
}

function decodeJwtPart<T>(value: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
  } catch {
    return null;
  }
}

export async function verifyAuthTokenAtEdge(
  token: string,
): Promise<EdgeAuthUser | null> {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJwtPart<{ alg?: string }>(encodedHeader);
  const payload = decodeJwtPart<Partial<EdgeAuthUser> & { exp?: number }>(
    encodedPayload,
  );

  if (
    !header ||
    header.alg !== "HS256" ||
    !payload ||
    typeof payload.userId !== "string" ||
    !/^\d+$/.test(payload.userId) ||
    typeof payload.email !== "string" ||
    typeof payload.role !== "string" ||
    !AUTH_ROLES.has(payload.role as UserRole) ||
    (typeof payload.exp === "number" &&
      payload.exp <= Math.floor(Date.now() / 1000))
  ) {
    return null;
  }

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(getServerEnv().JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
    );

    return isValid
      ? {
          userId: payload.userId,
          email: payload.email,
          role: payload.role as UserRole,
        }
      : null;
  } catch {
    return null;
  }
}
