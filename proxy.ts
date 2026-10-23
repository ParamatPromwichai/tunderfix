import { NextRequest, NextResponse } from "next/server";

import { verifyAuthTokenAtEdge, type EdgeAuthUser } from "@/lib/auth-edge";
import { type UserRole } from "@/lib/validations";

export class MiddlewareUnauthorizedError extends Error {
  readonly status = 401;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "MiddlewareUnauthorizedError";
  }
}

export class MiddlewareForbiddenError extends Error {
  readonly status = 403;

  constructor(message = "You do not have permission to access this resource") {
    super(message);
    this.name = "MiddlewareForbiddenError";
  }
}

export function requireAuth() {
  return async (request: NextRequest): Promise<EdgeAuthUser> => {
    const token = request.cookies.get("technician_finder_token")?.value;
    const user = token ? await verifyAuthTokenAtEdge(token) : null;

    if (!user) {
      throw new MiddlewareUnauthorizedError();
    }

    return user;
  };
}

export function requireRole(role: UserRole) {
  return async (request: NextRequest): Promise<EdgeAuthUser> => {
    const user = await requireAuth()(request);

    if (user.role !== role) {
      throw new MiddlewareForbiddenError();
    }

    return user;
  };
}

export async function proxy(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith("/dashboard/")) {
      const user = await requireAuth()(request);
      if (
        !pathname.startsWith(`/dashboard/${user.role}/`) &&
        pathname !== `/dashboard/${user.role}`
      ) {
        return NextResponse.redirect(
          new URL(`/dashboard/${user.role}`, request.url),
        );
      }
      return NextResponse.next();
    }

    if (pathname === "/api/auth/me") {
      await requireAuth()(request);
    } else if (
      pathname === "/api/customer" ||
      pathname.startsWith("/api/customer/")
    ) {
      await requireRole("customer")(request);
    } else if (
      pathname === "/api/technician" ||
      pathname.startsWith("/api/technician/")
    ) {
      await requireRole("technician")(request);
    } else if (
      pathname === "/api/admin" ||
      pathname.startsWith("/api/admin/")
    ) {
      await requireRole("admin")(request);
    }

    return NextResponse.next();
  } catch (error) {
    if (request.nextUrl.pathname.startsWith("/dashboard/")) {
      const login = new URL("/login", request.url);
      login.searchParams.set(
        "next",
        request.nextUrl.pathname + request.nextUrl.search,
      );
      return NextResponse.redirect(login);
    }
    if (error instanceof MiddlewareForbiddenError) {
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message },
        },
        { status: error.status },
      );
    }

    if (error instanceof MiddlewareUnauthorizedError) {
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message },
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: { message: "Authentication check failed" },
      },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/auth/me",
    "/api/customer/:path*",
    "/api/technician/:path*",
    "/api/admin/:path*",
  ],
};
