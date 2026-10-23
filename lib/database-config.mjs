import { z } from "zod";

export const databaseEnvSchema = z.object({
  DB_HOST: z.string().trim().min(1).default("localhost"),
  DB_USER: z.string().trim().min(1).default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().trim().min(1).default("technician_finder_simple"),
  DB_PORT: z.coerce.number().int().min(1).max(65_535).default(3306),
  DB_SSL: z.enum(["auto", "true", "false"]).default("auto"),
});

/** @param {NodeJS.ProcessEnv} [source] */
export function getDatabaseEnv(source = process.env) {
  return databaseEnvSchema.parse({
    DB_HOST: source.DB_HOST,
    DB_USER: source.DB_USER ?? source.DB_USERNAME,
    DB_PASSWORD: source.DB_PASSWORD,
    DB_NAME: source.DB_NAME ?? source.DB_DATABASE,
    DB_PORT: source.DB_PORT,
    DB_SSL: source.DB_SSL,
  });
}

/**
 * Shared by the app and CLI migrations. TiDB Cloud uses Node's trusted CAs.
 * @param {NodeJS.ProcessEnv} [source]
 * @returns {import("mysql2/promise").PoolOptions}
 */
export function getDatabaseOptions(source = process.env) {
  const env = getDatabaseEnv(source);
  const isTiDBCloud = env.DB_HOST.toLowerCase().endsWith(".tidbcloud.com");
  const useTls = isTiDBCloud || env.DB_SSL === "true";

  return {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    port: env.DB_PORT,
    ...(useTls
      ? {
          ssl: {
            rejectUnauthorized: true,
            verifyIdentity: true,
            minVersion: "TLSv1.2",
          },
        }
      : {}),
  };
}
