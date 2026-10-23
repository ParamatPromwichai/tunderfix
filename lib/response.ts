import { NextResponse } from "next/server";
import { type ZodError } from "zod";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  );
}

export function errorResponse(
  message: string,
  status = 500,
  details?: unknown,
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(details === undefined ? {} : { details }),
      },
    },
    { status },
  );
}

export function validationErrorResponse(error: ZodError) {
  return errorResponse("Invalid request data", 400, error.flatten().fieldErrors);
}
