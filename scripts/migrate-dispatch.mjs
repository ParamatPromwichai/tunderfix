import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";
import { getDatabaseOptions } from "../lib/database-config.mjs";

const connection = await mysql.createConnection({
  ...getDatabaseOptions(),
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
