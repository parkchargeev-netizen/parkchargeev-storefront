CREATE INDEX IF NOT EXISTS products_public_store_active_sort_idx
  ON products (sort_order ASC, updated_at DESC, id DESC)
  WHERE status = 'active';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS products_public_store_category_sort_idx
  ON products (category_id, sort_order ASC, updated_at DESC, id DESC)
  WHERE status = 'active';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS product_media_public_product_image_sort_idx
  ON product_media (product_id, is_primary DESC, sort_order ASC, id ASC)
  WHERE media_type = 'image';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS merchandising_slots_public_active_sort_idx
  ON merchandising_slots (slot_key, sort_order ASC, created_at ASC)
  WHERE is_active = true;