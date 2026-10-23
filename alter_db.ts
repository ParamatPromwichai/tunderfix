import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection("mysql://root:@localhost:3306/technician_finder_simple");
  console.log("Connected to database");
  try {
    await connection.execute("ALTER TABLE jobs ADD COLUMN final_price DECIMAL(10,2) NULL AFTER budget_max");
    console.log("Added final_price to jobs table");
  } catch (error) {
    console.error(error);
  }
  await connection.end();
}
main();
