import { errorResponse, successResponse } from "@/lib/response";
import { getHealthStatus } from "@/services/health.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const health = await getHealthStatus();

    const isolatedQa =
      process.env.THUNDERFIX_QA === "1" &&
      process.env.DB_NAME === "thunderfix_qa" &&
      process.env.DB_PORT === "3307";
    return successResponse({
      ...health,
      ...(isolatedQa ? { isolatedQa: true } : {}),
    });
  } catch (error) {
    console.error("[GET /api/health] Database health check failed", error);

    return errorResponse("Database connection failed", 503);
  }
}
