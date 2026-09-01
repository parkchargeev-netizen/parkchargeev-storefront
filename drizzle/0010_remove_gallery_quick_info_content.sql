UPDATE "products"
SET "schema_json_ld" = jsonb_set(
  "schema_json_ld",
  '{_parkchargeevPageContent}',
  (("schema_json_ld" -> '_parkchargeevPageContent')
    - 'galleryFeatureLabels'
    - 'galleryDeviceCaption'),
  true
)
WHERE "schema_json_ld" ? '_parkchargeevPageContent';
