ALTER TABLE "inventory_movements"
  ADD COLUMN IF NOT EXISTS "idempotency_key" varchar(160);

CREATE UNIQUE INDEX IF NOT EXISTS "inventory_movements_idempotency_key_idx"
  ON "inventory_movements" ("idempotency_key")
  WHERE "idempotency_key" IS NOT NULL;
