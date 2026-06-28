ALTER TYPE "admin_role" ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE "admin_role" ADD VALUE IF NOT EXISTS 'product_manager';
ALTER TYPE "admin_role" ADD VALUE IF NOT EXISTS 'order_manager';
ALTER TYPE "admin_role" ADD VALUE IF NOT EXISTS 'support_agent';
ALTER TYPE "admin_role" ADD VALUE IF NOT EXISTS 'readonly';

UPDATE "admin_users"
SET "role" = CASE "role"::text
  WHEN 'sales' THEN 'admin'::admin_role
  WHEN 'operations' THEN 'order_manager'::admin_role
  WHEN 'technician' THEN 'support_agent'::admin_role
  WHEN 'editor' THEN 'admin'::admin_role
  ELSE "role"
END
WHERE "role"::text IN ('sales', 'operations', 'technician', 'editor');

ALTER TABLE "site_settings"
  ADD COLUMN IF NOT EXISTS "maintenance_mode" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "maintenance_message" text,
  ADD COLUMN IF NOT EXISTS "shipping_settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS "tax_settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
  ADD COLUMN IF NOT EXISTS "payment_settings" jsonb DEFAULT '{}'::jsonb NOT NULL;

ALTER TABLE "brands"
  ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;

ALTER TABLE "categories"
  ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;

CREATE TABLE IF NOT EXISTS "inventory_movements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid REFERENCES "products"("id"),
  "variant_id" uuid REFERENCES "product_variants"("id"),
  "sku" varchar(120),
  "quantity_before" integer DEFAULT 0 NOT NULL,
  "quantity_after" integer DEFAULT 0 NOT NULL,
  "quantity_delta" integer DEFAULT 0 NOT NULL,
  "reason" varchar(80) NOT NULL,
  "note" text,
  "order_id" uuid,
  "admin_user_id" uuid REFERENCES "admin_users"("id"),
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "inventory_movements_product_idx"
  ON "inventory_movements" ("product_id");
CREATE INDEX IF NOT EXISTS "inventory_movements_variant_idx"
  ON "inventory_movements" ("variant_id");
CREATE INDEX IF NOT EXISTS "inventory_movements_created_at_idx"
  ON "inventory_movements" ("created_at");

CREATE TABLE IF NOT EXISTS "admin_notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(180) NOT NULL,
  "body" text NOT NULL,
  "tone" varchar(40) DEFAULT 'info' NOT NULL,
  "href" varchar(500),
  "entity_type" varchar(80),
  "entity_id" varchar(120),
  "is_read" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "read_at" timestamptz
);

CREATE INDEX IF NOT EXISTS "admin_notifications_read_idx"
  ON "admin_notifications" ("is_read", "created_at");
CREATE INDEX IF NOT EXISTS "admin_notifications_entity_idx"
  ON "admin_notifications" ("entity_type", "entity_id");

CREATE TABLE IF NOT EXISTS "banners" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "placement" varchar(80) DEFAULT 'home' NOT NULL,
  "title" varchar(180) NOT NULL,
  "subtitle" text,
  "image_url" varchar(500),
  "cta_label" varchar(80),
  "cta_href" varchar(500),
  "status" varchar(40) DEFAULT 'draft' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "starts_at" timestamptz,
  "ends_at" timestamptz,
  "deleted_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "banners_placement_idx"
  ON "banners" ("placement", "status", "sort_order");

CREATE TABLE IF NOT EXISTS "campaigns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(180) NOT NULL,
  "slug" varchar(220) NOT NULL,
  "description" text,
  "status" varchar(40) DEFAULT 'draft' NOT NULL,
  "discount_type" varchar(40) DEFAULT 'percent' NOT NULL,
  "discount_value" integer DEFAULT 0 NOT NULL,
  "starts_at" timestamptz,
  "ends_at" timestamptz,
  "deleted_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "campaigns_slug_idx"
  ON "campaigns" ("slug");
CREATE INDEX IF NOT EXISTS "campaigns_status_idx"
  ON "campaigns" ("status");

CREATE TABLE IF NOT EXISTS "campaign_products" (
  "campaign_id" uuid NOT NULL REFERENCES "campaigns"("id"),
  "product_id" uuid NOT NULL REFERENCES "products"("id"),
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "campaign_products_pk" PRIMARY KEY ("campaign_id", "product_id")
);

CREATE INDEX IF NOT EXISTS "campaign_products_product_idx"
  ON "campaign_products" ("product_id");

CREATE TABLE IF NOT EXISTS "campaign_categories" (
  "campaign_id" uuid NOT NULL REFERENCES "campaigns"("id"),
  "category_id" uuid NOT NULL REFERENCES "categories"("id"),
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "campaign_categories_pk" PRIMARY KEY ("campaign_id", "category_id")
);

CREATE INDEX IF NOT EXISTS "campaign_categories_category_idx"
  ON "campaign_categories" ("category_id");

CREATE TABLE IF NOT EXISTS "merchandising_slots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slot_key" varchar(80) NOT NULL,
  "title" varchar(180),
  "product_id" uuid REFERENCES "products"("id"),
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "starts_at" timestamptz,
  "ends_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "merchandising_slots_slot_idx"
  ON "merchandising_slots" ("slot_key", "sort_order");
