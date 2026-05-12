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

const navigationSeed = [
  ["primary", "Ana Sayfa", "/", 0],
  ["primary", "Magaza", "/magaza", 10],
  ["primary", "Kurumsal Cozumler", "/kurumsal-cozumler", 20],
  ["primary", "Hizmetler", "/hizmetler", 30],
  ["primary", "Harita", "/harita", 40],
  ["primary", "Blog", "/blog", 50],
  ["primary", "Iletisim", "/iletisim", 60],
  ["footer", "Hakkimizda", "/hakkimizda", 0],
  ["footer", "Kurumsal Cozumler", "/kurumsal-cozumler", 10],
  ["footer", "Magaza", "/magaza", 20],
  ["footer", "Blog", "/blog", 30],
  ["footer", "Harita", "/harita", 40],
  ["footer", "Iletisim", "/iletisim", 50],
  ["legal", "Destek Merkezi", "/iletisim", 0],
  ["legal", "Musteri Girisi", "/giris", 10],
  ["legal", "Odeme", "/odeme", 20],
  ["legal", "Sepet", "/sepet", 30]
];

const pageSeed = [
  {
    slug: "hakkimizda",
    title: "Hakkimizda",
    eyebrow: "Marka",
    excerpt:
      "ParkChargeEV marka yaklasimini, uzmanlik alanlarini ve elektrikli arac sarj ekosistemindeki hizmet modelini yonetin.",
    body:
      "<p>Bu sayfa admin panelindeki Site modulu uzerinden yayinlandiginda statik hakkimizda sayfasinin yerine gecer.</p>",
    seoTitle: "ParkChargeEV Hakkimizda",
    seoDescription:
      "ParkChargeEV'in elektrikli arac sarj urunleri, kurulum ve teknik servis yaklasimini kesfedin."
  },
  {
    slug: "hizmetler",
    title: "Hizmetler",
    eyebrow: "Cozumler",
    excerpt:
      "Kurulum, kesif, teknik servis ve kurumsal EV sarj altyapisi hizmetlerini admin panelinden yonetin.",
    body:
      "<p>Bu sayfa yayinlandiginda hizmetler sayfasinin icerigi ve SEO bilgileri admin panelinden kontrol edilir.</p>",
    seoTitle: "EV Sarj Hizmetleri",
    seoDescription:
      "Elektrikli arac sarj kurulumu, kesif, teknik servis ve kurumsal altyapi hizmetleri."
  },
  {
    slug: "iletisim",
    title: "Iletisim",
    eyebrow: "Basvuru",
    excerpt:
      "Teklif, kesif, kurulum, servis ve is ortakligi talepleri icin iletisim sayfasini yonetin.",
    body:
      "<p>Bu sayfa yayinlandiginda iletisim sayfasinin icerigi admin panelindeki Site modulu uzerinden guncellenir.</p>",
    seoTitle: "ParkChargeEV Iletisim",
    seoDescription:
      "Teklif, kesif, kurulum, servis ve is ortakligi talepleri icin ParkChargeEV ile iletisime gecin."
  }
];

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
    do $$
    begin
      create type site_page_status as enum ('draft', 'published', 'archived');
    exception
      when duplicate_object then null;
    end $$;
  `;
  await sql`
    do $$
    begin
      create type navigation_area as enum ('primary', 'footer', 'legal');
    exception
      when duplicate_object then null;
    end $$;
  `;
  await sql`
    create table if not exists site_pages (
      id uuid primary key default gen_random_uuid(),
      slug varchar(220) not null,
      title varchar(180) not null,
      eyebrow varchar(120),
      excerpt text not null,
      body text not null,
      seo_title varchar(255),
      seo_description varchar(320),
      canonical_url varchar(500),
      og_image_url varchar(500),
      status site_page_status not null default 'draft',
      show_in_sitemap boolean not null default true,
      no_index boolean not null default false,
      sitemap_priority integer not null default 70,
      change_frequency varchar(24) not null default 'monthly',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists navigation_items (
      id uuid primary key default gen_random_uuid(),
      area navigation_area not null default 'primary',
      label varchar(120) not null,
      href varchar(500) not null,
      sort_order integer not null default 0,
      is_active boolean not null default true,
      opens_in_new_tab boolean not null default false,
      rel varchar(120),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`create unique index if not exists site_pages_slug_idx on site_pages (slug)`;
  await sql`create index if not exists site_pages_status_idx on site_pages (status)`;
  await sql`
    with ranked as (
      select id, row_number() over (partition by area, href order by updated_at desc, created_at desc, id desc) as rn
      from navigation_items
    )
    delete from navigation_items
    where id in (select id from ranked where rn > 1)
  `;
  await sql`create index if not exists navigation_items_area_idx on navigation_items (area, sort_order)`;
  await sql`create unique index if not exists navigation_items_area_href_idx on navigation_items (area, href)`;

  for (const [area, label, href, sortOrder] of navigationSeed) {
    await sql`
      insert into navigation_items (area, label, href, sort_order, is_active, updated_at)
      values (${area}, ${label}, ${href}, ${sortOrder}, true, now())
      on conflict (area, href) do update set
        label = excluded.label,
        sort_order = excluded.sort_order,
        is_active = true,
        updated_at = now()
    `;
  }

  for (const page of pageSeed) {
    await sql`
      insert into site_pages (
        slug,
        title,
        eyebrow,
        excerpt,
        body,
        seo_title,
        seo_description,
        status,
        show_in_sitemap,
        no_index,
        sitemap_priority,
        change_frequency,
        updated_at
      )
      values (
        ${page.slug},
        ${page.title},
        ${page.eyebrow},
        ${page.excerpt},
        ${page.body},
        ${page.seoTitle},
        ${page.seoDescription},
        'draft',
        true,
        false,
        80,
        'monthly',
        now()
      )
      on conflict (slug) do nothing
    `;
  }

  console.log("Site CMS migration hazir: navigation_items ve site_pages aktif.");
} catch (error) {
  console.error("Site CMS migration sirasinda hata olustu.");
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
