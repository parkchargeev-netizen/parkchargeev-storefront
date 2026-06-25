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
  console.error("DIRECT_URL veya DATABASE_URL tanimli degil.");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  prepare: false,
  max: 1
});

try {
  await sql`
    create table if not exists media_assets (
      id uuid primary key,
      file_name varchar(180) not null,
      mime_type varchar(120) not null,
      byte_size integer not null,
      data bytea not null,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists media_assets_created_at_idx on media_assets (created_at)`;

  const smokeId = crypto.randomUUID();
  await sql`
    insert into media_assets (id, file_name, mime_type, byte_size, data)
    values (${smokeId}, 'smoke.txt', 'text/plain', 2, ${Buffer.from("ok")})
  `;
  const rows = await sql`select byte_size from media_assets where id = ${smokeId}`;
  await sql`delete from media_assets where id = ${smokeId}`;

  console.log(`media_assets hazir. Smoke rows: ${rows.length}`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
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
    const quote = value.charAt(0);

    if ((quote === "\"" || quote === "'") && value.endsWith(quote)) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}
