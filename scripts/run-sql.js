/* eslint-disable */
// Allow local migrations behind corporate/self-signed MITM proxies
process.env.NODE_TLS_REJECT_UNAUTHORIZED =
  process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0";
// Load .env.local first (if present), then .env
try {
  require("dotenv").config({ path: ".env.local" });
} catch {}
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required for db:migrate");
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { require: true, rejectUnauthorized: false },
  });
  await client.connect();

  const migrationsDir = path.join(process.cwd(), "src", "lib", "db", "sql");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, "utf-8");
    console.log(`Running migration: ${file}`);
    await client.query(sql);
  }

  await client.end();
  console.log("Migrations completed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
