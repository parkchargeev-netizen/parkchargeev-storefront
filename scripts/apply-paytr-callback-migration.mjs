import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import postgres from "postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

loadEnvFile(".env");
loadEnvFile(".env.local");

const databaseUrl = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error("DIRECT_URL or DATABASE_URL is required for PayTR callback migration.");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  prepare: false,
  max: 1
});

try {
  await sql`alter type order_status add value if not exists 'payment_failed'`;
  await sql`alter table paytr_transactions add column if not exists failed_reason_code varchar(40)`;
  await sql`alter table paytr_transactions add column if not exists failed_reason_msg text`;
  console.log("PayTR callback migration applied.");
} finally {
  await sql.end();
}

function loadEnvFile(fileName) {
  const envPath = path.join(rootDir, fileName);

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex < 0) {
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

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
