import { type RowDataPacket } from "mysql2";

import { db } from "@/lib/db";

type HealthRow = RowDataPacket & {
  result: number;
};

export async function checkDatabase(): Promise<boolean> {
  const [rows] = await db.query<HealthRow[]>("SELECT 1 AS result");

  return rows[0]?.result === 1;
}
