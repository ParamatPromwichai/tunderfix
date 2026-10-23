import 'dotenv/config';
import { db } from "./lib/db";

async function alterTable() {
  try {
    await db.query(`ALTER TABLE technician_services ADD COLUMN experience_years TINYINT UNSIGNED NULL;`);
    console.log("Column added successfully");
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Column already exists");
    } else {
      console.error("Error:", error);
    }
  } finally {
    process.exit(0);
  }
}

alterTable();
