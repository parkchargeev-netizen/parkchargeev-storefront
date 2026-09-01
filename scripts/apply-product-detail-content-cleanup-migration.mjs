import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import postgres from "postgres";

const root = process.cwd();

for (const envFile of [".env", ".env.local"]) {
  const path = join(root, envFile);

  if (!existsSync(path)) {
    continue;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").replace(/^[ '\"]|[ '\"]$/g, "").trim();
    process.env[key] ??= value;
  }
}

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL veya DIRECT_URL tanimli degil.");
  process.exit(1);
}

const migrationFiles = [
  "0008_remove_product_detail_auxiliary_sections.sql",
  "0009_products_sort_order_and_detail_cleanup.sql"
];

const sql = postgres(databaseUrl, {
  max: 1,
  ssl: databaseUrl.includes("localhost") ? false : "require"
});

try {
  for (const file of migrationFiles) {
    const migrationPath = join(root, "drizzle", file);
    const migrationSql = readFileSync(migrationPath, "utf8");
    const statements = migrationSql
      .split(/;\s*(?:\r?\n|$)/)
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await sql.unsafe(statement);
    }

    console.log(`${file} applied.`);
  }
} catch (error) {
  console.error("Product detail content cleanup migration failed.", {
    message: error instanceof Error ? error.message : String(error),
    code: error?.code
  });
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
