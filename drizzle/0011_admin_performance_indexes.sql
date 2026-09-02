CREATE INDEX IF NOT EXISTS "products_status_sort_updated_idx"
  ON "products" ("status", "sort_order", "updated_at" DESC, "id" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variants_stock_product_idx"
  ON "product_variants" ("stock_quantity", "product_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_product_import_history_idx"
  ON "audit_logs" ("entity_type", "created_at" DESC)
  WHERE "entity_type" = 'product_import';