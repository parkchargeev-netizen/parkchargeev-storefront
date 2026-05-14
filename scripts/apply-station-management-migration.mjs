import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

import postgres from "postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

loadEnvFile(".env");
loadEnvFile(".env.local");

const databaseUrl = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
const stationSeed = loadStationSeed();

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
    create table if not exists charging_stations (
      id uuid primary key default gen_random_uuid(),
      external_id varchar(140) not null,
      name varchar(180) not null,
      status varchar(80) not null default 'Aktif',
      power varchar(80) not null,
      connector_types jsonb not null default '[]'::jsonb,
      price_per_kwh varchar(80) not null,
      city varchar(80) not null,
      district varchar(80) not null,
      address text not null,
      latitude double precision not null,
      longitude double precision not null,
      available_sockets integer not null default 0,
      total_sockets integer not null default 0,
      hours varchar(120) not null,
      operator varchar(120) not null,
      amenities jsonb not null default '[]'::jsonb,
      is_active boolean not null default true,
      sort_order integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`create unique index if not exists charging_stations_external_id_idx on charging_stations (external_id)`;
  await sql`create index if not exists charging_stations_city_district_idx on charging_stations (city, district)`;
  await sql`create index if not exists charging_stations_active_sort_idx on charging_stations (is_active, sort_order)`;
  await sql`
    create table if not exists cart_recovery_intents (
      id uuid primary key default gen_random_uuid(),
      email varchar(180) not null,
      full_name varchar(180),
      phone varchar(40),
      total_kurus integer not null default 0,
      item_count integer not null default 0,
      items jsonb not null default '[]'::jsonb,
      status varchar(40) not null default 'captured',
      source varchar(80) not null default 'checkout',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists cart_recovery_intents_email_idx on cart_recovery_intents (email)`;
  await sql`create index if not exists cart_recovery_intents_status_idx on cart_recovery_intents (status)`;

  for (const [index, station] of stationSeed.entries()) {
    await sql`
      insert into charging_stations (
        external_id,
        name,
        status,
        power,
        connector_types,
        price_per_kwh,
        city,
        district,
        address,
        latitude,
        longitude,
        available_sockets,
        total_sockets,
        hours,
        operator,
        amenities,
        is_active,
        sort_order,
        updated_at
      )
      values (
        ${station.id},
        ${station.name},
        ${station.status},
        ${station.power},
        ${sql.json(station.connectorTypes ?? [])},
        ${station.pricePerKwh},
        ${station.city},
        ${station.district},
        ${station.address},
        ${station.latitude},
        ${station.longitude},
        ${station.availableSockets},
        ${station.totalSockets},
        ${station.hours},
        ${station.operator},
        ${sql.json(station.amenities ?? [])},
        true,
        ${index},
        now()
      )
      on conflict (external_id) do update set
        name = excluded.name,
        status = excluded.status,
        power = excluded.power,
        connector_types = excluded.connector_types,
        price_per_kwh = excluded.price_per_kwh,
        city = excluded.city,
        district = excluded.district,
        address = excluded.address,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        available_sockets = excluded.available_sockets,
        total_sockets = excluded.total_sockets,
        hours = excluded.hours,
        operator = excluded.operator,
        amenities = excluded.amenities,
        sort_order = excluded.sort_order,
        updated_at = now()
    `;
  }

  await sql`
    insert into navigation_items (area, label, href, sort_order, is_active, updated_at)
    values ('primary', 'Ürün Seçici', '/urun-secici', 15, true, now())
    on conflict (area, href) do update set
      label = excluded.label,
      sort_order = excluded.sort_order,
      is_active = true,
      updated_at = now()
  `;
  await sql`
    insert into navigation_items (area, label, href, sort_order, is_active, updated_at)
    values ('footer', 'Karşılaştır', '/karsilastir', 25, true, now())
    on conflict (area, href) do update set
      label = excluded.label,
      sort_order = excluded.sort_order,
      is_active = true,
      updated_at = now()
  `;

  console.log("Istasyon yonetimi migration hazir: charging_stations tablosu aktif.");
} catch (error) {
  console.error("Istasyon yonetimi migration sirasinda hata olustu.");
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

function loadStationSeed() {
  const filePath = path.join(rootDir, "src", "lib", "mock-data.ts");

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const source = fs.readFileSync(filePath, "utf8");
  const match = source.match(/export const stations: StationModel\[\] = (\[[\s\S]*?\n\]);/);

  if (!match) {
    return [];
  }

  try {
    const stations = vm.runInNewContext(match[1], {}, { timeout: 1000 });
    return Array.isArray(stations) ? stations : [];
  } catch {
    return [];
  }
}
