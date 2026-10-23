// Tables whose id is normally AUTO_INCREMENT in the application schema.
export const identityTables = Object.freeze([
  "users",
  "technician_profiles",
  "service_categories",
  "technician_services",
  "jobs",
  "job_requests",
  "chat_rooms",
  "chat_messages",
  "notifications",
  "reviews",
  "urgent_offers",
]);

/** @param {string} table */
export function identitySequence(table) {
  if (!identityTables.includes(table))
    throw new Error("Unknown identity table");
  return `thunderfix_${table}_id_seq`;
}

/** @param {string} sql */
export function insertTable(sql) {
  const match = sql.match(
    /^\s*INSERT(?:\s+IGNORE)?\s+INTO\s+`?([a-z_]+)`?\s*\(/i,
  );
  if (!match || !identityTables.includes(match[1])) {
    throw new Error("Expected a single-row insert into an identity table");
  }
  return match[1];
}

/** @param {string} sql */
export function withSequenceIdentity(sql) {
  const table = insertTable(sql);
  const match = sql.match(
    /^(\s*INSERT(?:\s+IGNORE)?\s+INTO\s+`?[a-z_]+`?\s*\()([^)]*)(\)\s*VALUES\s*\()/i,
  );
  if (
    !match ||
    match[2]
      .split(",")
      .some((column) => column.trim().replaceAll("`", "") === "id")
  ) {
    throw new Error("Expected VALUES without an explicit id column");
  }
  // LAST_INSERT_ID also returns the generated value in mysql2's OK packet.
  return sql.replace(
    match[0],
    `${match[1]}id, ${match[2]}${match[3]}LAST_INSERT_ID(NEXTVAL(\`${identitySequence(table)}\`)), `,
  );
}
