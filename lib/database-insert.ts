import type {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import {
  identityTables,
  insertTable,
  withSequenceIdentity,
} from "@/lib/database-identities.mjs";

type Executor = Pool | PoolConnection;
let sequenceTables: Promise<Set<string>> | undefined;

function getSequenceTables(connection: Executor): Promise<Set<string>> {
  // One schema per app pool. Use the caller's connection to avoid pool starvation
  // when several transactions arrive together on a cold serverless instance.
  if (!sequenceTables) {
    sequenceTables = connection
      .execute<RowDataPacket[]>(
        `SELECT TABLE_NAME AS table_name, EXTRA AS extra
       FROM information_schema.columns
       WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = 'id'`,
      )
      .then(
        ([rows]) =>
          new Set(
            rows
              .filter(
                (row) =>
                  identityTables.includes(row.table_name) &&
                  !/auto_increment|auto_random/i.test(row.extra),
              )
              .map((row) => String(row.table_name)),
          ),
      )
      .catch((error) => {
        sequenceTables = undefined;
        throw error;
      });
  }
  return sequenceTables;
}

export async function executeInsert(
  connection: Executor,
  sql: string,
  values: (string | number | boolean | null | Date)[],
) {
  const table = insertTable(sql);
  const legacyTables = await getSequenceTables(connection);
  const [result, fields] = await connection.execute<ResultSetHeader>(
    legacyTables.has(table) ? withSequenceIdentity(sql) : sql,
    values,
  );
  // LAST_INSERT_ID(expr) is evaluated even when INSERT IGNORE inserts nothing.
  // Callers must still be able to detect an existing chat room and select its ID.
  if (/^\s*INSERT\s+IGNORE\b/i.test(sql) && result.affectedRows === 0) {
    result.insertId = 0;
  }
  return [result, fields] as const;
}
