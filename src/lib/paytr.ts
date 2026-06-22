import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { getPaytrConfig, RuntimeConfigError } from "@/lib/runtime-config";

export type PaytrCheckoutItem = {
  title: string;
  unitPrice: string;
  quantity: number;
};

export type PaytrCurrency = "TL" | "TRY" | "EUR" | "USD" | "GBP" | "RUB";

export type PaytrIframeRequestInput = {
  email: string;
  paymentAmountKurus: number;
  userIp: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  okUrl: string;
  failUrl: string;
  items: PaytrCheckoutItem[];
  currency?: PaytrCurrency;
  noInstallment?: 0 | 1;
  maxInstallment?: number;
  testMode?: 0 | 1;
  debugOn?: 0 | 1;
  timeoutLimit?: number;
  iframeV2?: 0 | 1;
  lang?: "tr" | "en";
  merchantOid?: string;
};

export type PaytrCallbackPayload = {
  merchant_oid: string;
  status: "success" | "failed";
  total_amount: string;
  hash: string;
  payment_type?: string;
  currency?: string;
  payment_amount?: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  installment_count?: string;
  test_mode?: string;
};

export function encodeBasket(items: PaytrCheckoutItem[]) {
  const basket = items.map((item) => [
    item.title,
    item.unitPrice,
    item.quantity
  ]);

  return Buffer.from(JSON.stringify(basket), "utf-8").toString("base64");
}

export function generateMerchantOid(prefix = "PCEV") {
  return `${prefix}${randomUUID().replaceAll("-", "").toUpperCase()}`;
}

export function redactPaytrPayload(payload: Record<string, string>) {
  return {
    ...payload,
    paytr_token: "[redacted]"
  };
}

function getPaytrRuntimeOptions(input: {
  currency?: PaytrCurrency;
  testMode?: 0 | 1;
  debugOn?: 0 | 1;
}) {
  const testMode = parsePaytrBooleanEnv(process.env.PAYTR_TEST_MODE, 0);
  const debugOn = parsePaytrBooleanEnv(process.env.PAYTR_DEBUG_ON, 0);

  return {
    currency:
      input.currency ?? ((process.env.PAYTR_CURRENCY as PaytrCurrency | undefined) ?? "TL"),
    testMode: input.testMode ?? testMode,
    debugOn: input.debugOn ?? debugOn
  };
}

function parsePaytrBooleanEnv(value: string | undefined, fallback: 0 | 1): 0 | 1 {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return fallback;
  }

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return 1;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return 0;
  }

  return fallback;
}

function assertPaytrMerchantIdFormat(merchantId: string) {
  if (/^\d+$/.test(merchantId.trim())) {
    return;
  }

  throw new RuntimeConfigError({
    area: "paytr",
    missingKeys: ["PAYTR_MERCHANT_ID"],
    message:
      "PayTR mağaza numarası geçersiz görünüyor. PAYTR_MERCHANT_ID değeri PayTR panelindeki sayısal mağaza numarası olmalıdır."
  });
}

export function buildPaytrIframePayload(input: PaytrIframeRequestInput) {
  const env = getPaytrConfig();
  assertPaytrMerchantIdFormat(env.merchantId);
  const merchantOid = input.merchantOid ?? generateMerchantOid();
  const { currency, testMode, debugOn } = getPaytrRuntimeOptions(input);
  const noInstallment = input.noInstallment ?? 0;
  const maxInstallment = input.maxInstallment ?? 0;
  const timeoutLimit =
    input.timeoutLimit ?? Number(process.env.PAYTR_TIMEOUT_LIMIT ?? "30");
  const userBasket = encodeBasket(input.items);

  const hashString =
    env.merchantId +
    input.userIp +
    merchantOid +
    input.email +
    String(input.paymentAmountKurus) +
    userBasket +
    String(noInstallment) +
    String(maxInstallment) +
    currency +
    String(testMode);

  const paytrToken = createHmac("sha256", env.merchantKey)
    .update(hashString + env.merchantSalt)
    .digest("base64");

  return {
    merchant_id: env.merchantId,
    user_ip: input.userIp,
    merchant_oid: merchantOid,
    email: input.email,
    payment_amount: String(input.paymentAmountKurus),
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: String(debugOn),
    no_installment: String(noInstallment),
    max_installment: String(maxInstallment),
    user_name: input.userName,
    user_address: input.userAddress,
    user_phone: input.userPhone,
    merchant_ok_url: input.okUrl,
    merchant_fail_url: input.failUrl,
    timeout_limit: String(timeoutLimit),
    currency,
    test_mode: String(testMode),
    iframe_v2: String(input.iframeV2 ?? 1),
    lang: input.lang ?? "tr"
  };
}

export function verifyPaytrCallbackHash(payload: PaytrCallbackPayload) {
  const env = getPaytrConfig();
  const computedHash = createHmac("sha256", env.merchantKey)
    .update(
      payload.merchant_oid +
        env.merchantSalt +
        payload.status +
        payload.total_amount
    )
    .digest("base64");

  const expectedHash = Buffer.from(computedHash);
  const receivedHash = Buffer.from(payload.hash);

  return (
    expectedHash.length === receivedHash.length &&
    timingSafeEqual(expectedHash, receivedHash)
  );
}
