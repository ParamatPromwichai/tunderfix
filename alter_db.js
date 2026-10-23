const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  console.log("Connected to database");
  try {
    await connection.execute("ALTER TABLE jobs ADD COLUMN final_price DECIMAL(10,2) NULL AFTER budget_max");
    console.log("Added final_price to jobs table");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("final_price already exists");
    } else {
      console.error(error);
    }
  }
  await connection.end();
}
main();
