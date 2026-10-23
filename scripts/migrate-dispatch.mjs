import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "technician_finder_simple",
  port: Number(process.env.DB_PORT || 3306),
  multipleStatements: true,
});
try {
  await connection.query(
    await readFile(
      new URL("../database_scema/002_urgent_dispatch.sql", import.meta.url),
      "utf8",
    ),
  );
  console.log("Urgent dispatch tables are ready.");
} finally {
  await connection.end();
}
