import { NextRequest } from "next/server";

import { requireAuth, UnauthorizedError } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";
import { getActiveUserById } from "@/services/auth.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const tokenUser = requireAuth()(request);
    const user = await getActiveUserById(tokenUser.userId);

    if (!user) {
      return errorResponse("Authentication required", 401);
    }

    return successResponse({ user });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.status);
    }

    console.error("[GET /api/auth/me] Authenticated user lookup failed", error);

    return errorResponse("Unable to load authenticated user", 500);
  }
}
