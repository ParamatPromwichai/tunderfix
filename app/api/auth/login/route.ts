import { NextRequest } from "next/server";

import { setAuthCookie } from "@/lib/auth";
import {
  errorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/response";
import { loginSchema } from "@/lib/validations";
import {
  InvalidCredentialsError,
  SuspendedAccountError,
  loginUser,
} from "@/services/auth.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON", 400);
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await loginUser(parsed.data);
    const response = successResponse({ user: result.user });

    setAuthCookie(response, result.token);

    return response;
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return errorResponse(error.message, 401);
    }

    if (error instanceof SuspendedAccountError) {
      return errorResponse(error.message, 403);
    }

    console.error("[POST /api/auth/login] Login failed", error);

    return errorResponse("Unable to login", 500);
  }
}
