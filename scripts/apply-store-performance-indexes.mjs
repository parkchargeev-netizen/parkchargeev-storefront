import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const rootDir = process.cwd();

loadEnvFile(".env");
loadEnvFile(".env.local");

const databaseUrl = (process.env.DATABASE_URL ?? "").trim();

if (!databaseUrl) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const migrationPath = path.join(rootDir, "drizzle", "0012_store_performance_indexes.sql");
const statements = fs
  .readFileSync(migrationPath, "utf8")
  .split("--> statement-breakpoint")
  .map((statement) => statement.trim())
  .filter(Boolean);

const sql = postgres(databaseUrl, {
  connect_timeout: 10,
  max: 1,
  prepare: false
});

try {
  for (const statement of statements) {
    await sql.unsafe(statement);
  }

  console.log(`Store performance indexes applied: ${statements.length}`);
} finally {
  await sql.end({ timeout: 5 });
}

function loadEnvFile(fileName) {
  const filePath = path.join(rootDir, fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}