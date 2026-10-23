import { createHash } from "node:crypto";
import mysql, { type Pool } from "mysql2/promise";

import { getDatabaseOptions } from "@/lib/database-config.mjs";

const globalForDatabase = globalThis as unknown as {
  mysqlPool?: Pool;
  mysqlPoolConfig?: string;
};

const options = {
  ...getDatabaseOptions(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
};
const configKey = createHash("sha256")
  .update(JSON.stringify(options))
  .digest("hex");
const cachedPool = globalForDatabase.mysqlPool;
const canReusePool = cachedPool && globalForDatabase.mysqlPoolConfig === configKey;

// Hot reload must not retain an insecure pool or credentials from an older .env.
if (cachedPool && !canReusePool) {
  void cachedPool.end().catch(() => {
    console.warn("Could not close the previous database pool.");
  });
}

export const db: Pool = canReusePool ? cachedPool : mysql.createPool(options);

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.mysqlPool = db;
  globalForDatabase.mysqlPoolConfig = configKey;
}

export async function testDatabaseConnection(): Promise<void> {
  const connection = await db.getConnection();

  try {
    await connection.query("SELECT 1");
  } finally {
    connection.release();
  }
}
