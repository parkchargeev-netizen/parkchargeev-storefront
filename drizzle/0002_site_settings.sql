CREATE TABLE IF NOT EXISTS "site_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "singleton_key" varchar(40) DEFAULT 'main' NOT NULL,
  "brand_name" varchar(120) DEFAULT 'ParkChargeEV' NOT NULL,
  "description" text NOT NULL,
  "logo_url" varchar(500),
  "logo_alt" varchar(180),
  "phone" varchar(40) NOT NULL,
  "email" varchar(180) NOT NULL,
  "whatsapp_phone" varchar(40) NOT NULL,
  "support_hours" varchar(80) NOT NULL,
  "street_address" varchar(255) NOT NULL,
  "address_locality" varchar(120) NOT NULL,
  "address_region" varchar(120) NOT NULL,
  "postal_code" varchar(20) DEFAULT '' NOT NULL,
  "address_country" varchar(8) DEFAULT 'TR' NOT NULL,
  "map_embed_url" varchar(1200),
  "service_areas" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "socials" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "site_settings_singleton_idx"
  ON "site_settings" ("singleton_key");

INSERT INTO "site_settings" (
  "singleton_key",
  "brand_name",
  "description",
  "phone",
  "email",
  "whatsapp_phone",
  "support_hours",
  "street_address",
  "address_locality",
  "address_region",
  "postal_code",
  "address_country",
  "service_areas",
  "socials",
  "updated_at"
)
VALUES (
  'main',
  'ParkChargeEV',
  'Elektrikli araç şarj cihazları, ev tipi wallbox ürünleri, Type 2 aksesuarlar, keşif, kurulum ve teknik destek çözümleri.',
  '05514914320',
  'info@parkchargeev.com',
  '905514914320',
  'Mo-Sa 09:00-18:00',
  'Esentepe Mah. Akademiyolu Sokak Sakarya Üniversitesi Teknokent B Blok 10B/Z05',
  'Serdivan',
  'Sakarya',
  '',
  'TR',
  '["Türkiye geneli"]'::jsonb,
  '{}'::jsonb,
  now()
)
ON CONFLICT ("singleton_key") DO NOTHING;
