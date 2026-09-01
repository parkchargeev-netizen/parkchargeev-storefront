UPDATE products
SET schema_json_ld = jsonb_set(
  schema_json_ld,
  '{_parkchargeevPageContent}',
  ((schema_json_ld -> '_parkchargeevPageContent')
    - 'infoCards'
    - 'smartFeatures'
    - 'smartFeaturesEnabled'
    - 'smartFeaturesEyebrow'
    - 'smartFeaturesHeading'
    - 'policiesEnabled'
    - 'policyDetails'),
  true
)
WHERE schema_json_ld ? '_parkchargeevPageContent';