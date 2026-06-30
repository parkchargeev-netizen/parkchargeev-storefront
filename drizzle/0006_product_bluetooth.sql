ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "has_bluetooth" boolean DEFAULT false NOT NULL;
