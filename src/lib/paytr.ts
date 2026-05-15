import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { getPaytrConfig } from "@/lib/runtime-config";

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

export type PaytrDirectApiRequestInput = Omit<
  PaytrIframeRequestInput,
  "noInstallment" | "maxInstallment" | "timeoutLimit" | "iframeV2" | "lang"
> & {
  installmentCount?: 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  cardType?:
    | ""
    | "advantage"
    | "axess"
    | "combo"
    | "bonus"
    | "cardfinans"
    | "maximum"
    | "paraf"
    | "world"
    | "saglamkart";
  non3d?: 0 | 1;
  non3dTestFailed?: 0 | 1;
  clientLang?: "tr" | "en";
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
};

export const PAYTR_DIRECT_API_FORM_ACTION = "https://www.paytr.com/odeme";

export function encodeBasket(items: PaytrCheckoutItem[]) {
  const basket = items.map((item) => [
    item.title,
    item.unitPrice,
    item.quantity
  ]);

  return Buffer.from(JSON.stringify(basket), "utf-8").toString("base64");
}

export function encodeDirectApiBasket(items: PaytrCheckoutItem[]) {
  return JSON.stringify(
    items.map((item) => [item.title, item.unitPrice, item.quantity])
  );
}

export function generateMerchantOid(prefix = "PCEV") {
  return `${prefix}${randomUUID().replaceAll("-", "").toUpperCase()}`;
}

function getPaytrRuntimeOptions(input: {
  currency?: PaytrCurrency;
  testMode?: 0 | 1;
  debugOn?: 0 | 1;
}) {
  return {
    currency:
      input.currency ?? ((process.env.PAYTR_CURRENCY as PaytrCurrency | undefined) ?? "TL"),
    testMode:
      input.testMode ?? (process.env.PAYTR_TEST_MODE === "1" ? 1 : 0),
    debugOn:
      input.debugOn ?? (process.env.PAYTR_DEBUG_ON === "1" ? 1 : 0)
  };
}

function formatKurusAsPaytrAmount(paymentAmountKurus: number) {
  return (paymentAmountKurus / 100).toFixed(2);
}

export function buildPaytrIframePayload(input: PaytrIframeRequestInput) {
  const env = getPaytrConfig();
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

export function buildPaytrDirectApiPayload(input: PaytrDirectApiRequestInput) {
  const env = getPaytrConfig();
  const merchantOid = input.merchantOid ?? generateMerchantOid();
  const { currency, testMode, debugOn } = getPaytrRuntimeOptions(input);
  const non3d = input.non3d ?? 0;
  const installmentCount = input.installmentCount ?? 0;
  const paymentAmount = formatKurusAsPaytrAmount(input.paymentAmountKurus);
  const paymentType = "card";
  const userBasket = encodeDirectApiBasket(input.items);

  const hashString =
    env.merchantId +
    input.userIp +
    merchantOid +
    input.email +
    paymentAmount +
    paymentType +
    String(installmentCount) +
    currency +
    String(testMode) +
    String(non3d);

  const paytrToken = createHmac("sha256", env.merchantKey)
    .update(hashString + env.merchantSalt)
    .digest("base64");

  return {
    merchant_id: env.merchantId,
    user_ip: input.userIp,
    merchant_oid: merchantOid,
    email: input.email,
    payment_type: paymentType,
    payment_amount: paymentAmount,
    currency,
    test_mode: String(testMode),
    non_3d: String(non3d),
    merchant_ok_url: input.okUrl,
    merchant_fail_url: input.failUrl,
    user_name: input.userName,
    user_address: input.userAddress,
    user_phone: input.userPhone,
    user_basket: userBasket,
    debug_on: String(debugOn),
    client_lang: input.clientLang ?? "tr",
    paytr_token: paytrToken,
    non3d_test_failed: String(input.non3dTestFailed ?? 0),
    installment_count: String(installmentCount),
    card_type: input.cardType ?? ""
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
