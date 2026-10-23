// Preview first: npm run db:migrate:avatars
// Apply: node --env-file=.env scripts/migrate-avatars.mjs --apply
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { put, del } from "@vercel/blob";
import mysql from "mysql2/promise";
import { getDatabaseOptions } from "../lib/database-config.mjs";
import { getAvatarAccess, getAvatarUrl } from "../lib/avatar-config.mjs";

const apply = process.argv.includes("--apply");
const access = getAvatarAccess();
const root = resolve("public/uploads/avatars");
const types = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};
const connection = await mysql.createConnection(getDatabaseOptions());
const summary = {
  mode: apply ? "apply" : "preview",
  found: 0,
  ready: 0,
  migrated: 0,
  skipped: 0,
  failed: 0,
};

try {
  const [users] = await connection.execute(
    "SELECT id, avatar_url FROM users WHERE avatar_url LIKE '/uploads/avatars/%'",
  );
  summary.found = users.length;

  for (const user of users) {
    const name = user.avatar_url.slice("/uploads/avatars/".length);
    const match = name.match(/^\d+-\d+\.(jpg|jpeg|png|webp|gif)$/i);
    const filePath = resolve(root, name);
    if (!match || dirname(filePath) !== root) {
      summary.skipped++;
      continue;
    }

    let bytes;
    try {
      bytes = await readFile(filePath);
    } catch {
      summary.skipped++;
      continue;
    }
    summary.ready++;
    if (!apply) continue;

    let blob;
    try {
      blob = await put(
        `avatars/${user.id}/${randomUUID()}.${match[1].toLowerCase()}`,
        bytes,
        {
          access,
          contentType: types[match[1].toLowerCase()],
          addRandomSuffix: false,
          token: process.env.BLOB_READ_WRITE_TOKEN,
        },
      );
      // Preserve a newer avatar if the user updated their profile during migration.
      const [result] = await connection.execute(
        "UPDATE users SET avatar_url = ? WHERE id = ? AND avatar_url = ?",
        [getAvatarUrl(blob, access), user.id, user.avatar_url],
      );
      if (result.affectedRows) summary.migrated++;
      else {
        await del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
        summary.skipped++;
      }
    } catch {
      // Keep an uploaded blob if a DB write failed ambiguously: it may be referenced.
      // Original local files are always retained as a fallback.
      summary.failed++;
    }
  }
} finally {
  await connection.end();
  console.log(JSON.stringify(summary, null, 2));
}
if (summary.failed) process.exitCode = 1;
