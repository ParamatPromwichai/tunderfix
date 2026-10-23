import { errorResponse, successResponse } from "@/lib/response";
import { getHealthStatus } from "@/services/health.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const health = await getHealthStatus();

    return successResponse(health);
  } catch (error) {
    console.error("[GET /api/health] Database health check failed", error);

    return errorResponse("Database connection failed", 503);
  }
}
