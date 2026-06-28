ALTER TABLE "inventory_movements"
  ADD COLUMN IF NOT EXISTS "idempotency_key" varchar(160);

CREATE UNIQUE INDEX IF NOT EXISTS "inventory_movements_idempotency_key_idx"
  ON "inventory_movements" ("idempotency_key")
  WHERE "idempotency_key" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "ai_insights" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "module_key" varchar(80) NOT NULL,
  "title" varchar(180) NOT NULL,
  "summary" text NOT NULL,
  "severity" varchar(40) DEFAULT 'info' NOT NULL,
  "confidence" integer DEFAULT 60 NOT NULL,
  "action_label" varchar(120),
  "action_href" varchar(500),
  "source_type" varchar(80),
  "source_id" varchar(120),
  "payload" jsonb,
  "status" varchar(40) DEFAULT 'open' NOT NULL,
  "created_by_admin_id" uuid REFERENCES "admin_users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "ai_insights_module_idx"
  ON "ai_insights" ("module_key", "status");

CREATE INDEX IF NOT EXISTS "ai_insights_source_idx"
  ON "ai_insights" ("source_type", "source_id");

CREATE INDEX IF NOT EXISTS "ai_insights_created_at_idx"
  ON "ai_insights" ("created_at");

CREATE TABLE IF NOT EXISTS "ai_generation_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "module_key" varchar(80) NOT NULL,
  "provider" varchar(40) DEFAULT 'openai' NOT NULL,
  "model" varchar(80),
  "prompt_version" varchar(40) DEFAULT 'v1' NOT NULL,
  "status" varchar(40) DEFAULT 'success' NOT NULL,
  "input_payload" jsonb,
  "output_payload" jsonb,
  "error_message" text,
  "duration_ms" integer DEFAULT 0 NOT NULL,
  "created_by_admin_id" uuid REFERENCES "admin_users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "ai_generation_runs_module_idx"
  ON "ai_generation_runs" ("module_key", "created_at");

CREATE INDEX IF NOT EXISTS "ai_generation_runs_status_idx"
  ON "ai_generation_runs" ("status");

CREATE TABLE IF NOT EXISTS "admin_automations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "automation_key" varchar(100) NOT NULL,
  "title" varchar(180) NOT NULL,
  "description" text NOT NULL,
  "status" varchar(40) DEFAULT 'active' NOT NULL,
  "trigger_type" varchar(60) DEFAULT 'scheduled' NOT NULL,
  "schedule" varchar(80) DEFAULT 'daily' NOT NULL,
  "config" jsonb,
  "last_run_at" timestamp with time zone,
  "last_status" varchar(40),
  "last_message" text,
  "created_by_admin_id" uuid REFERENCES "admin_users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_automations_key_idx"
  ON "admin_automations" ("automation_key");

CREATE INDEX IF NOT EXISTS "admin_automations_status_idx"
  ON "admin_automations" ("status");

CREATE TABLE IF NOT EXISTS "admin_automation_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "automation_id" uuid REFERENCES "admin_automations"("id"),
  "automation_key" varchar(100) NOT NULL,
  "trigger_source" varchar(40) DEFAULT 'manual' NOT NULL,
  "status" varchar(40) DEFAULT 'success' NOT NULL,
  "summary" text,
  "result_payload" jsonb,
  "error_message" text,
  "duration_ms" integer DEFAULT 0 NOT NULL,
  "created_by_admin_id" uuid REFERENCES "admin_users"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "admin_automation_runs_automation_idx"
  ON "admin_automation_runs" ("automation_key", "created_at");

CREATE INDEX IF NOT EXISTS "admin_automation_runs_status_idx"
  ON "admin_automation_runs" ("status");

CREATE TABLE IF NOT EXISTS "admin_daily_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "report_date" varchar(10) NOT NULL,
  "title" varchar(180) NOT NULL,
  "summary" text NOT NULL,
  "payload" jsonb,
  "created_by_run_id" uuid REFERENCES "admin_automation_runs"("id"),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_daily_reports_date_idx"
  ON "admin_daily_reports" ("report_date");

INSERT INTO "admin_automations"
  ("automation_key", "title", "description", "status", "trigger_type", "schedule")
VALUES
  ('critical_stock_notification', 'Kritik stok bildirimi', 'Kritik stok seviyesine düşen ürünler için admin bildirimi üretir.', 'active', 'scheduled', 'hourly'),
  ('payment_failure_risk', 'Ödeme hatası risk uyarısı', 'PayTR başarısız işlem oranı yükseldiğinde risk ve bildirim kaydı üretir.', 'active', 'scheduled', 'hourly'),
  ('delayed_order_alert', 'Geciken sipariş uyarısı', 'Bekleyen veya hazırlıkta kalan siparişler için aksiyon önerir.', 'active', 'scheduled', 'daily'),
  ('missing_product_content', 'Eksik ürün içerik kontrolü', 'SEO, açıklama veya medya bilgisi eksik ürünleri listeler.', 'active', 'scheduled', 'daily'),
  ('daily_admin_report', 'Günlük admin özet raporu', 'Günlük satış, risk ve operasyon özetini AI destekli rapora dönüştürür.', 'active', 'scheduled', 'daily')
ON CONFLICT ("automation_key") DO NOTHING;
