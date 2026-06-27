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
  await sql`create extension if not exists pgcrypto`;
  await sql`
    create table if not exists site_settings (
      id uuid primary key default gen_random_uuid(),
      singleton_key varchar(40) not null default 'main',
      brand_name varchar(120) not null default 'ParkChargeEV',
      description text not null,
      logo_url varchar(500),
      logo_alt varchar(180),
      phone varchar(40) not null,
      email varchar(180) not null,
      whatsapp_phone varchar(40) not null,
      support_hours varchar(80) not null,
      street_address varchar(255) not null,
      address_locality varchar(120) not null,
      address_region varchar(120) not null,
      postal_code varchar(20) not null default '',
      address_country varchar(8) not null default 'TR',
      map_embed_url varchar(1200),
      service_areas jsonb not null default '[]'::jsonb,
      socials jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    create unique index if not exists site_settings_singleton_idx
      on site_settings (singleton_key)
  `;
  await sql`
    insert into site_settings (
      singleton_key,
      brand_name,
      description,
      phone,
      email,
      whatsapp_phone,
      support_hours,
      street_address,
      address_locality,
      address_region,
      postal_code,
      address_country,
      service_areas,
      socials,
      updated_at
    )
    values (
      'main',
      'ParkChargeEV',
      'Elektrikli arac sarj cihazlari, ev tipi wallbox urunleri, Type 2 aksesuarlar, kesif, kurulum ve teknik destek cozumleri.',
      '05514914320',
      'info@parkchargeev.com',
      '905514914320',
      'Mo-Sa 09:00-18:00',
      'Esentepe Mah. Akademiyolu Sokak Sakarya Universitesi Teknokent B Blok 10B/Z05',
      'Serdivan',
      'Sakarya',
      '',
      'TR',
      '["Turkiye geneli"]'::jsonb,
      '{}'::jsonb,
      now()
    )
    on conflict (singleton_key) do nothing
  `;

  console.log("Site settings tablosu hazir.");
} catch (error) {
  console.error("Site settings kurulumu sirasinda hata olustu.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await sql.end();
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
