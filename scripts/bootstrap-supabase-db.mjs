import fs from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import postgres from "postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

loadEnvFile(".env");
loadEnvFile(".env.local");

const databaseUrl = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
const defaultMigrationPath = path.resolve(
  __dirname,
  "..",
  "drizzle",
  "0000_secret_mulholland_black.sql"
);
const migrationPath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : defaultMigrationPath;
const requiredTables = [
  "admin_sessions",
  "admin_users",
  "audit_logs",
  "blog_posts",
  "brands",
  "cart_items",
  "carts",
  "categories",
  "customer_addresses",
  "customers",
  "order_items",
  "order_status_history",
  "orders",
  "paytr_transactions",
  "product_category_assignments",
  "product_media",
  "product_relations",
  "product_specs",
  "product_tag_assignments",
  "product_variants",
  "product_vehicle_compatibilities",
  "products",
  "quote_activities",
  "quote_requests",
  "service_leads"
];

if (!databaseUrl) {
  console.error("DIRECT_URL veya DATABASE_URL tanimli degil.");
  console.error(
    "Ornek: DIRECT_URL=postgresql://postgres:[PASSWORD]@db.<project-ref>.supabase.co:5432/postgres"
  );
  process.exit(1);
}

await access(migrationPath);

const migrationSql = await readFile(migrationPath, "utf8");
const statements = [
  "create extension if not exists pgcrypto;",
  ...migrationSql
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean)
];

const client = postgres(databaseUrl, {
  prepare: false,
  max: 1
});

try {
  const missingTables = await listMissingTables(client);

  if (missingTables.length === 0) {
    console.log("Supabase semasi zaten hazir, migration atlandi.");
  } else {
    if (missingTables.length !== requiredTables.length) {
      console.log(
        `Eksik tablo sayisi: ${missingTables.length}. Migration kalan semayi tamamlamayi deneyecek.`
      );
    }

    console.log(`Supabase schema bootstrap basliyor: ${migrationPath}`);

    for (const [index, statement] of statements.entries()) {
      console.log(`Statement ${index + 1}/${statements.length} calistiriliyor...`);
      await client.unsafe(statement);
    }

    console.log("Supabase veritabani semasi basariyla olusturuldu.");
  }

  await ensureBootstrapAdmin(client);
} catch (error) {
  console.error("Supabase schema bootstrap sirasinda hata olustu.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end();
}

async function listMissingTables(sql) {
  const missingTables = [];

  for (const tableName of requiredTables) {
    const [row] = await sql`
      select to_regclass(${`public.${tableName}`}) as table_name
    `;

    if (!row?.table_name) {
      missingTables.push(tableName);
    }
  }

  return missingTables;
}

async function ensureBootstrapAdmin(sql) {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  const fullName =
    process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "ParkChargeEV Superadmin";

  if (!email || !password) {
    console.log(
      "Bootstrap admin atlandi: ADMIN_BOOTSTRAP_EMAIL veya ADMIN_BOOTSTRAP_PASSWORD eksik."
    );
    return;
  }

  const [admin] = await sql`
    insert into admin_users (email, full_name, role, status, password_hash, updated_at)
    values (
      ${email},
      ${fullName},
      'superadmin',
      'active',
      ${hashPassword(password)},
      now()
    )
    on conflict (email) do update set
      full_name = excluded.full_name,
      role = 'superadmin',
      status = 'active',
      password_hash = excluded.password_hash,
      updated_at = now()
    returning id, email, role
  `;

  console.log(`Bootstrap admin hazir: ${admin.email} (${admin.role})`);
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

function loadEnvFile(fileName) {
  const filePath = path.join(rootDir, fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

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
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}
