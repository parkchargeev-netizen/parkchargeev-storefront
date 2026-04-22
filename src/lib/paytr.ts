import { createHmac, randomUUID } from "node:crypto";

import { getPaytrConfig } from "@/lib/runtime-config";

export type PaytrCheckoutItem = {
  title: string;
  unitPrice: string;
  quantity: number;
};

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
  currency?: "TL" | "TRY" | "EUR" | "USD" | "GBP" | "RUB";
  noInstallment?: 0 | 1;
  maxInstallment?: number;
  testMode?: 0 | 1;
  debugOn?: 0 | 1;
  timeoutLimit?: number;
  iframeV2?: 0 | 1;
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
  return `${prefix}-${randomUUID()}`;
}

export function buildPaytrIframePayload(input: PaytrIframeRequestInput) {
  const env = getPaytrConfig();
  const merchantOid = input.merchantOid ?? generateMerchantOid();
  const currency = input.currency ?? (process.env.PAYTR_CURRENCY as "TL") ?? "TL";
  const noInstallment = input.noInstallment ?? 0;
  const maxInstallment = input.maxInstallment ?? 0;
  const testMode =
    input.testMode ?? (process.env.PAYTR_TEST_MODE === "1" ? 1 : 0);
  const debugOn =
    input.debugOn ?? (process.env.PAYTR_DEBUG_ON === "1" ? 1 : 0);
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
    iframe_v2: String(input.iframeV2 ?? 1)
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

  return computedHash === payload.hash;
}
