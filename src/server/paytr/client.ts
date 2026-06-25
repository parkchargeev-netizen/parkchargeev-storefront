import { createHmac } from "node:crypto";

import { getPaytrConfig } from "@/lib/runtime-config";

export type PaytrTokenResponse =
  | { status: "success"; token: string }
  | { status: "failed"; reason?: string };

export type PaytrLinkCreateResponse =
  | { status: "success"; id: string; link: string }
  | { status: "failed"; reason?: string; raw: Record<string, unknown> };

const paytrTokenUrl = "https://www.paytr.com/odeme/api/get-token";
const paytrLinkCreateUrl = "https://www.paytr.com/odeme/api/link/create";
const paytrStatusQueryUrl = "https://www.paytr.com/odeme/durum-sorgu";

export type PaytrStatusQueryResponse =
  | {
      status: "success";
      paymentAmountKurus: number | null;
      paymentTotalKurus: number | null;
      currency: string | null;
      raw: Record<string, unknown>;
    }
  | {
      status: "error";
      errNo?: string;
      errMsg?: string;
      raw: Record<string, unknown>;
    };

function getPaytrRequestTimeoutMs() {
  const configuredValue = Number(process.env.PAYTR_REQUEST_TIMEOUT_MS ?? "12000");

  if (!Number.isFinite(configuredValue) || configuredValue < 3000) {
    return 12000;
  }

  return Math.min(configuredValue, 20000);
}

function parsePaytrDecimalToKurus(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const rawValue = String(value).trim();

  if (!rawValue) {
    return null;
  }

  const normalizedValue = rawValue.includes(",")
    ? rawValue.replace(/\./g, "").replace(",", ".")
    : rawValue;
  const amount = Number(normalizedValue);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100);
}

async function readPaytrTokenResponse(response: Response): Promise<PaytrTokenResponse> {
  const rawBody = await response.text();

  if (!rawBody.trim()) {
    return {
      status: "failed",
      reason: "PayTR token servisi boş yanıt döndürdü."
    };
  }

  try {
    const body = JSON.parse(rawBody) as Record<string, unknown>;

    if (body.status === "success" && typeof body.token === "string") {
      return {
        status: "success",
        token: body.token
      };
    }

    if (body.status === "failed") {
      return {
        status: "failed",
        reason:
          typeof body.reason === "string" && body.reason
            ? body.reason
            : "PayTR token servisi işlemi reddetti."
      };
    }

    return {
      status: "failed",
      reason: "PayTR token servisi geçersiz yanıt döndürdü."
    };
  } catch {
    return {
      status: "failed",
      reason: "PayTR token servisi okunamayan bir yanıt döndürdü."
    };
  }
}

export async function requestPaytrIframeToken(payload: Record<string, string>) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), getPaytrRequestTimeoutMs());

  try {
    const response = await fetch(paytrTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(payload).toString(),
      cache: "no-store",
      signal: controller.signal
    });
    const body = await readPaytrTokenResponse(response);

    if (!response.ok) {
      return {
        status: "failed" as const,
        reason: body.status === "failed" ? body.reason : "PayTR token servisi yanıt vermedi."
      };
    }

    return body;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        status: "failed" as const,
        reason: "PayTR token isteği zaman aşımına uğradı."
      };
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestPaytrPaymentLink(
  payload: Record<string, string>
): Promise<PaytrLinkCreateResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), getPaytrRequestTimeoutMs());

  try {
    const response = await fetch(paytrLinkCreateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(payload).toString(),
      cache: "no-store",
      signal: controller.signal
    });
    const rawBody = await response.text();
    let body: Record<string, unknown>;

    try {
      body = rawBody.trim()
        ? (JSON.parse(rawBody) as Record<string, unknown>)
        : {
            status: "failed",
            reason: "PayTR Link API boş yanıt döndürdü."
          };
    } catch {
      body = {
        status: "failed",
        reason: "PayTR Link API okunamayan bir yanıt döndürdü."
      };
    }

    if (
      response.ok &&
      body.status === "success" &&
      typeof body.id === "string" &&
      typeof body.link === "string"
    ) {
      return {
        status: "success",
        id: body.id,
        link: body.link
      };
    }

    return {
      status: "failed",
      reason:
        typeof body.reason === "string"
          ? body.reason
          : typeof body.err_msg === "string"
            ? body.err_msg
            : "PayTR Link API ödeme linkini oluşturamadı.",
      raw: body
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        status: "failed",
        reason: "PayTR Link API isteği zaman aşımına uğradı.",
        raw: {
          status: "failed",
          reason: "PayTR Link API isteği zaman aşımına uğradı."
        }
      };
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestPaytrTransactionStatus(
  merchantOid: string
): Promise<PaytrStatusQueryResponse> {
  const env = getPaytrConfig();
  const paytrToken = createHmac("sha256", env.merchantKey)
    .update(env.merchantId + merchantOid + env.merchantSalt)
    .digest("base64");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), getPaytrRequestTimeoutMs());

  try {
    const response = await fetch(paytrStatusQueryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        merchant_id: env.merchantId,
        merchant_oid: merchantOid,
        paytr_token: paytrToken
      }).toString(),
      cache: "no-store",
      signal: controller.signal
    });
    const rawBody = await response.text();
    let body: Record<string, unknown>;

    try {
      body = rawBody.trim()
        ? (JSON.parse(rawBody) as Record<string, unknown>)
        : {
            status: "error",
            err_msg: "PayTR durum sorgu servisi boş yanıt döndürdü."
          };
    } catch {
      body = {
        status: "error",
        err_msg: "PayTR durum sorgu servisi okunamayan bir yanıt döndürdü.",
        raw_body: rawBody
      };
    }

    if (!response.ok && body.status !== "success") {
      return {
        status: "error",
        errNo: typeof body.err_no === "string" ? body.err_no : undefined,
        errMsg:
          typeof body.err_msg === "string"
            ? body.err_msg
            : "PayTR durum sorgu servisi yanıt vermedi.",
        raw: body
      };
    }

    if (body.status === "success") {
      return {
        status: "success",
        paymentAmountKurus: parsePaytrDecimalToKurus(body.payment_amount),
        paymentTotalKurus: parsePaytrDecimalToKurus(body.payment_total),
        currency: typeof body.currency === "string" ? body.currency : null,
        raw: body
      };
    }

    return {
      status: "error",
      errNo: typeof body.err_no === "string" ? body.err_no : undefined,
      errMsg:
        typeof body.err_msg === "string"
          ? body.err_msg
          : "PayTR durum sorgu servisi işlemi doğrulayamadı.",
      raw: body
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        status: "error",
        errMsg: "PayTR durum sorgu isteği zaman aşımına uğradı.",
        raw: {
          status: "error",
          err_msg: "PayTR durum sorgu isteği zaman aşımına uğradı."
        }
      };
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
