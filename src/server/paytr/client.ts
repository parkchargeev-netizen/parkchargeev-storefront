export type PaytrTokenResponse =
  | { status: "success"; token: string }
  | { status: "failed"; reason?: string };

const paytrTokenUrl = "https://www.paytr.com/odeme/api/get-token";

function getPaytrRequestTimeoutMs() {
  const configuredValue = Number(process.env.PAYTR_REQUEST_TIMEOUT_MS ?? "12000");

  if (!Number.isFinite(configuredValue) || configuredValue < 3000) {
    return 12000;
  }

  return Math.min(configuredValue, 20000);
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
    const body = (await response.json()) as PaytrTokenResponse;

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
