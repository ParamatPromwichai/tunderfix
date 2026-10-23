import { checkDatabase } from "@/repositories/health.repository";

export async function getHealthStatus() {
  const databaseIsHealthy = await checkDatabase();

  return {
    status: databaseIsHealthy ? "ok" : "error",
    database: databaseIsHealthy ? "connected" : "unavailable",
    timestamp: new Date().toISOString(),
  } as const;
}
