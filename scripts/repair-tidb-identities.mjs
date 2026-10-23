// Preview: node --env-file=.env scripts/repair-tidb-identities.mjs
// Apply:   node --env-file=.env scripts/repair-tidb-identities.mjs --apply
// Additive only: creates sequences; never rebuilds or renames existing tables.
import mysql from "mysql2/promise";
import { getDatabaseOptions } from "../lib/database-config.mjs";
import {
  identityTables,
  identitySequence,
} from "../lib/database-identities.mjs";

const apply = process.argv.includes("--apply");
const db = await mysql.createConnection({
  ...getDatabaseOptions(),
  supportBigNumbers: true,
  bigNumberStrings: true,
});
try {
  const [[version]] = await db.query("SELECT VERSION() AS version");
  if (!/tidb/i.test(version.version))
    throw new Error("This repair is only for TiDB");
  const [columns] = await db.query(
    `SELECT TABLE_NAME AS table_name, EXTRA AS extra, COLUMN_TYPE AS column_type, COLUMN_KEY AS column_key
     FROM information_schema.columns WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = 'id'`,
  );
  const targets = columns.filter(
    (row) =>
      identityTables.includes(row.table_name) &&
      !/auto_increment|auto_random/i.test(row.extra),
  );
  const report = [];
  for (const column of targets) {
    if (
      !/^bigint(?:\(\d+\))?(?: unsigned)?$/i.test(column.column_type) ||
      column.column_key !== "PRI"
    ) {
      throw new Error(`Unexpected identity column in ${column.table_name}`);
    }
    const table = column.table_name;
    const sequence = identitySequence(table);
    const [[row]] = await db.query(
      `SELECT COALESCE(MAX(id), 0) AS max_id FROM \`${table}\``,
    );
    const maximum = BigInt(row.max_id);
    const next = maximum + 1n;
    if (next >= 9223372036854775807n)
      throw new Error(`Sequence range exceeded in ${table}`);
    if (apply) {
      await db.query(
        `CREATE SEQUENCE IF NOT EXISTS \`${sequence}\` START WITH ${next} NOCACHE NOCYCLE`,
      );
      // SETVAL only advances; reruns cannot reuse previously allocated IDs.
      if (maximum > 0n)
        await db.query(`SELECT SETVAL(\`${sequence}\`, ${maximum})`);
    }
    report.push({ table, sequence, nextAfterExistingData: String(next) });
  }
  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "preview",
        affectedTables: report.length,
        sequences: report,
      },
      null,
      2,
    ),
  );
} finally {
  await db.end();
}
