import { NextRequest } from "next/server";

import { setAuthCookie } from "@/lib/auth";
import {
  errorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/response";
import { registerSchema } from "@/lib/validations";
import {
  DuplicateEmailError,
} from "@/repositories/auth.repository";
import { registerUser } from "@/services/auth.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON", 400);
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const result = await registerUser(parsed.data);
    const response = successResponse({ user: result.user }, 201);

    setAuthCookie(response, result.token);

    return response;
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return errorResponse(error.message, 409);
    }

    console.error("[POST /api/auth/register] Registration failed", error);

    return errorResponse("Unable to register account", 500);
  }
}
