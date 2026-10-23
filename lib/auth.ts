import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { z } from "zod";

import { getServerEnv, userRoleSchema, type UserRole } from "@/lib/validations";

export const AUTH_COOKIE_NAME = "technician_finder_token";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const authTokenPayloadSchema = z.object({
  userId: z.string().regex(/^\d+$/),
  email: z.string().email(),
  role: userRoleSchema,
});

export type AuthTokenPayload = z.infer<typeof authTokenPayloadSchema>;

export class UnauthorizedError extends Error {
  readonly status = 401;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;

  constructor(message = "You do not have permission to access this resource") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function createAuthToken(user: {
  id: string;
  email: string;
  role: UserRole;
}): string {
  const payload: AuthTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, getServerEnv().JWT_SECRET, {
    algorithm: "HS256",
    subject: user.id,
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getServerEnv().JWT_SECRET, {
      algorithms: ["HS256"],
    });
    const payload = decoded as JwtPayload;
    const parsed = authTokenPayloadSchema.safeParse(payload);

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function getAuthUserFromRequest(
  request: NextRequest,
): AuthTokenPayload | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  return token ? verifyAuthToken(token) : null;
}

export function requireAuth() {
  return (request: NextRequest): AuthTokenPayload => {
    const user = getAuthUserFromRequest(request);

    if (!user) {
      throw new UnauthorizedError();
    }

    return user;
  };
}

export function requireRole(role: UserRole) {
  return (request: NextRequest): AuthTokenPayload => {
    const user = requireAuth()(request);

    if (user.role !== role) {
      throw new ForbiddenError();
    }

    return user;
  };
}

export async function getAuthUserFromCookies(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  return token ? verifyAuthToken(token) : null;
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
