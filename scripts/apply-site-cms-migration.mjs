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
  ["primary", "Mağaza", "/magaza", 10],
  ["primary", "Kurumsal Çözümler", "/kurumsal-cozumler", 20],
  ["primary", "Hizmetler", "/hizmetler", 30],
  ["primary", "Blog", "/blog", 50],
  ["primary", "İletişim", "/iletisim", 60],
  ["footer", "Hakkımızda", "/hakkimizda", 0],
  ["footer", "Kurumsal Çözümler", "/kurumsal-cozumler", 10],
  ["footer", "Mağaza", "/magaza", 20],
  ["footer", "Blog", "/blog", 30],
  ["footer", "İletişim", "/iletisim", 50],
  ["legal", "Destek Merkezi", "/iletisim", 0],
  ["legal", "Müşteri Girişi", "/giris", 10],
  ["legal", "Ödeme", "/odeme", 20],
  ["legal", "Sepet", "/sepet", 30]
];

const pageSeed = [
  {
    slug: "hakkimizda",
    title: "Hakkımızda",
    eyebrow: "Marka",
    excerpt:
      "ParkChargeEV marka yaklaşımını, uzmanlık alanlarını ve elektrikli araç şarj ekosistemindeki hizmet modelini yönetin.",
    body:
      "<p>Bu sayfa admin panelindeki Site modülü üzerinden yayınlandığında statik hakkımızda sayfasının yerine geçer.</p>",
    seoTitle: "ParkChargeEV Hakkımızda",
    seoDescription:
      "ParkChargeEV'in elektrikli araç şarj ürünleri, kurulum ve teknik servis yaklaşımını keşfedin."
  },
  {
    slug: "hizmetler",
    title: "Hizmetler",
    eyebrow: "Çözümler",
    excerpt:
      "Kurulum, keşif, teknik servis ve kurumsal EV şarj altyapısı hizmetlerini admin panelinden yönetin.",
    body:
      "<p>Bu sayfa yayınlandığında hizmetler sayfasının içeriği ve SEO bilgileri admin panelinden kontrol edilir.</p>",
    seoTitle: "EV Şarj Hizmetleri",
    seoDescription:
      "Elektrikli araç şarj kurulumu, keşif, teknik servis ve kurumsal altyapı hizmetleri."
  },
  {
    slug: "iletisim",
    title: "İletişim",
    eyebrow: "Başvuru",
    excerpt:
      "Teklif, keşif, kurulum, servis ve iş ortaklığı talepleri için iletişim sayfasını yönetin.",
    body:
      "<p>Bu sayfa yayınlandığında iletişim sayfasının içeriği admin panelindeki Site modülü üzerinden güncellenir.</p>",
    seoTitle: "ParkChargeEV İletişim",
    seoDescription:
      "Teklif, keşif, kurulum, servis ve iş ortaklığı talepleri için ParkChargeEV ile iletişime geçin."
  }
];

if (!databaseUrl) {
  console.error("DIRECT_URL veya DATABASE_URL tanımlı değil.");
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

  await sql`delete from navigation_items where href = '/harita'`;

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

  console.log("Site CMS migration hazır: navigation_items ve site_pages aktif.");
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
