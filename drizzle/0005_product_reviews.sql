CREATE TABLE IF NOT EXISTS "product_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL REFERENCES "products"("id"),
  "author_name" varchar(120) NOT NULL,
  "author_email" varchar(180),
  "rating" integer DEFAULT 5 NOT NULL,
  "title" varchar(160),
  "body" text NOT NULL,
  "status" varchar(40) DEFAULT 'approved' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "product_reviews_product_idx"
  ON "product_reviews" ("product_id", "status");

CREATE INDEX IF NOT EXISTS "product_reviews_created_at_idx"
  ON "product_reviews" ("created_at");
