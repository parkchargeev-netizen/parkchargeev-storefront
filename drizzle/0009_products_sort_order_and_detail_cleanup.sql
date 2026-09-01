ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;

UPDATE "products"
SET "sort_order" = COALESCE(NULLIF("schema_json_ld" -> '_parkchargeevPageContent' ->> 'adminSortOrder', '')::integer, 0)
WHERE "sort_order" = 0
  AND "schema_json_ld" -> '_parkchargeevPageContent' ->> 'adminSortOrder' IS NOT NULL;

CREATE INDEX IF NOT EXISTS "products_sort_order_idx" ON "products" ("sort_order");

UPDATE "products"
SET "schema_json_ld" = jsonb_set(
  "schema_json_ld",
  '{_parkchargeevPageContent}',
  (("schema_json_ld" -> '_parkchargeevPageContent')
    - 'purchaseBenefits'
    - 'purchaseReadiness'
    - 'decisionChecks'
    - 'infoCards'
    - 'smartFeatures'
    - 'smartFeaturesEnabled'
    - 'smartFeaturesEyebrow'
    - 'smartFeaturesHeading'
    - 'policiesEnabled'
    - 'policyDetails'
    - 'trustEnabled'
    - 'trustEyebrow'
    - 'trustHeading'
    - 'trustBlocks'),
  true
)
WHERE "schema_json_ld" ? '_parkchargeevPageContent';
