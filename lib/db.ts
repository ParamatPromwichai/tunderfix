import mysql, { type Pool } from "mysql2/promise";

import { getServerEnv } from "@/lib/validations";

const globalForDatabase = globalThis as unknown as {
  mysqlPool?: Pool;
};

function createPool(): Pool {
  const env = getServerEnv();

  return mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    port: env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });
}

export const db: Pool = globalForDatabase.mysqlPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.mysqlPool = db;
}

export async function testDatabaseConnection(): Promise<void> {
  const connection = await db.getConnection();

  try {
    await connection.query("SELECT 1");
  } finally {
    connection.release();
  }
}
