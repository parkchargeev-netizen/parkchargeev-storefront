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
