export function logPaytrRuntimeEnvPresence(context: string) {
  console.log({
    event: "paytr.runtime.env_presence",
    context,
    hasPaytrMerchantId: Boolean(process.env.PAYTR_MERCHANT_ID?.trim()),
    hasPaytrMerchantKey: Boolean(process.env.PAYTR_MERCHANT_KEY?.trim()),
    hasPaytrMerchantSalt: Boolean(process.env.PAYTR_MERCHANT_SALT?.trim()),
    hasPaytrTestMode: Boolean(process.env.PAYTR_TEST_MODE?.trim()),
    paytrTestModeEnabled: process.env.PAYTR_TEST_MODE?.trim() === "1",
    hasNextPublicSupabaseUrl: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim()
    ),
    hasSupabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
  });
}

export function logPaytrCallbackDebug(fields: {
  merchantOid: string;
  status: string;
  hashValid?: boolean;
  dbUpdateSucceeded?: boolean;
  hasFailedReasonCode?: boolean;
  hasFailedReasonMessage?: boolean;
}) {
  console.log({
    event: "paytr.callback.debug",
    merchantOid: fields.merchantOid || null,
    hasMerchantOid: Boolean(fields.merchantOid),
    status: fields.status || null,
    hasStatus: Boolean(fields.status),
    hashValid: fields.hashValid ?? null,
    dbUpdateSucceeded: fields.dbUpdateSucceeded ?? null,
    hasFailedReasonCode: fields.hasFailedReasonCode ?? false,
    hasFailedReasonMessage: fields.hasFailedReasonMessage ?? false
  });
}
