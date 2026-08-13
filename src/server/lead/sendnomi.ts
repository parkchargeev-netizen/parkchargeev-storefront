import { randomUUID } from "node:crypto";

import { logError, logInfo, logWarn } from "@/lib/server-logger";

type SendNomiLead = {
  fullName: string;
  company?: string | null;
  email: string;
  phone: string;
  city: string;
  reason: string;
  message: string;
  createdAt: Date;
};

type SendNomiDeliveryResult =
  | { status: "sent"; requestId?: string | null }
  | { status: "skipped"; reason: "missing_configuration" }
  | { status: "failed"; reason: "request_failed"; httpStatus?: number };

const DEFAULT_LEAD_INTAKE_URL = "https://app.sendnomi.com/api/public/lead-intake/lif_pub_cJuYrIXV78VJWMNetB9synmGdyIac3DG";
const DEFAULT_API_BASE_URL = "https://api.sendnomi.com";
const FALLBACK_API_BASE_URLS = ["https://api.sendnomi.com/api", "https://app.sendnomi.com/api"];
const DEFAULT_TO_EMAIL = "parkchargeev@gmail.com";

function normalizeApiBaseUrl(baseUrl: string) {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");

  if (cleanBaseUrl === "https://api.sendnomi.com" || cleanBaseUrl === "http://api.sendnomi.com") {
    return DEFAULT_API_BASE_URL;
  }

  if (cleanBaseUrl === "https://app.sendnomi.com" || cleanBaseUrl === "http://app.sendnomi.com") {
    return "https://app.sendnomi.com/api";
  }

  return cleanBaseUrl;
}

function getApiBaseUrls() {
  const configuredBaseUrl = process.env.SENDNOMI_API_BASE_URL?.trim();
  const baseUrls = [
    configuredBaseUrl ? normalizeApiBaseUrl(configuredBaseUrl) : DEFAULT_API_BASE_URL,
    DEFAULT_API_BASE_URL,
    ...FALLBACK_API_BASE_URLS
  ];

  return Array.from(new Set(baseUrls));
}

function getToEmail() {
  return process.env.SENDNOMI_TO_EMAIL?.trim() || DEFAULT_TO_EMAIL;
}

function getFromEmail() {
  return process.env.SENDNOMI_FROM_EMAIL?.trim() || process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "info@parkchargeev.com";
}

function getApiKey() {
  return process.env.SENDNOMI_API_KEY?.trim() || "";
}

export function shouldRequireSendNomiDelivery() {
  return process.env.SENDNOMI_REQUIRE_DELIVERY === "1";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatLeadRows(lead: SendNomiLead) {
  const rows = [
    ["Ad Soyad", lead.fullName],
    ["Firma / Site", lead.company || "-"],
    ["E-posta", lead.email],
    ["Telefon", lead.phone],
    ["\u015eehir", lead.city],
    ["Talep tipi", lead.reason],
    ["G\u00f6nderim zaman\u0131", lead.createdAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })]
  ];

  return rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #dbe7e2;color:#48625b;font-size:13px;font-weight:700;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #dbe7e2;color:#062c24;font-size:14px;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");
}

function buildHtml(lead: SendNomiLead) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f3faf7;padding:24px;color:#062c24;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dbe7e2;border-radius:16px;overflow:hidden;">
        <div style="background:#063f33;color:#ffffff;padding:20px 24px;">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8ff3d0;">ParkChargeEV ileti\u015fim formu</p>
          <h1 style="margin:0;font-size:22px;line-height:1.3;">Yeni teklif / ke\u015fif talebi</h1>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          ${formatLeadRows(lead)}
        </table>
        <div style="padding:18px 24px 24px;">
          <p style="margin:0 0 8px;color:#48625b;font-size:13px;font-weight:700;">\u0130htiya\u00e7 \u00f6zeti</p>
          <div style="white-space:pre-wrap;border-radius:12px;background:#eef8f4;border:1px solid #dbe7e2;padding:14px 16px;color:#062c24;font-size:14px;line-height:1.6;">${escapeHtml(lead.message)}</div>
        </div>
      </div>
    </div>`;
}

function buildText(lead: SendNomiLead) {
  return [
    "ParkChargeEV ileti\u015fim formu - Yeni teklif / ke\u015fif talebi",
    `Ad Soyad: ${lead.fullName}`,
    `Firma / Site: ${lead.company || "-"}`,
    `E-posta: ${lead.email}`,
    `Telefon: ${lead.phone}`,
    `\u015eehir: ${lead.city}`,
    `Talep tipi: ${lead.reason}`,
    `G\u00f6nderim zaman\u0131: ${lead.createdAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
    "",
    "\u0130htiya\u00e7 \u00f6zeti:",
    lead.message
  ].join("\n");
}

async function readResponsePreview(response: Response) {
  try {
    return (await response.text()).slice(0, 400);
  } catch {
    return "";
  }
}

function getLeadIntakeUrl() {
  const configuredUrl = process.env.SENDNOMI_LEAD_INTAKE_URL?.trim();
  return (configuredUrl || DEFAULT_LEAD_INTAKE_URL).replace(/\/+$/, "");
}

function getSiteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/+$/, "") || "https://parkchargeev.com";
}

function getLeadIntakeOrigins() {
  const configuredOrigin = process.env.SENDNOMI_LEAD_INTAKE_ORIGIN?.trim()?.replace(/\/+$/, "");
  const origins = [configuredOrigin, getSiteOrigin(), "https://parkchargeev.com", "https://www.parkchargeev.com"];

  return Array.from(new Set(origins.filter((origin): origin is string => Boolean(origin))));
}

function getSafeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

function buildLeadIntakeFields(lead: SendNomiLead) {
  return {
    fullName: lead.fullName,
    company: lead.company || "",
    email: lead.email,
    phone: lead.phone,
    city: lead.city,
    reason: lead.reason,
    message: lead.message,
    privacyConsent: "true",
    landing_url: `${getSiteOrigin()}/iletisim`
  };
}

async function deliverLeadToLeadIntake(lead: SendNomiLead): Promise<SendNomiDeliveryResult | null> {
  const leadIntakeUrl = getLeadIntakeUrl();

  if (!leadIntakeUrl) {
    return null;
  }

  let lastFailure: { status: number; requestId: string | null; responsePreview: string; origin: string } | null = null;

  for (const origin of getLeadIntakeOrigins()) {
    const response = await fetch(leadIntakeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        Referer: `${origin}/iletisim`
      },
      body: JSON.stringify({ fields: buildLeadIntakeFields(lead) })
    });

    const requestId = response.headers.get("x-request-id");

    if (response.ok) {
      logInfo("lead.sendnomi.lead_intake_sent", {
        status: response.status,
        requestId,
        leadIntakeOriginHost: getSafeHost(origin)
      });

      return { status: "sent", requestId };
    }

    lastFailure = {
      status: response.status,
      requestId,
      responsePreview: await readResponsePreview(response),
      origin
    };

    if (response.status !== 403) {
      break;
    }
  }

  logWarn("lead.sendnomi.lead_intake_failed", {
    status: lastFailure?.status,
    requestId: lastFailure?.requestId,
    responsePreview: lastFailure?.responsePreview,
    leadIntakeOriginHost: lastFailure ? getSafeHost(lastFailure.origin) : undefined
  });

  return { status: "failed", reason: "request_failed", httpStatus: lastFailure?.status };
}
export async function deliverLeadToSendNomi(lead: SendNomiLead): Promise<SendNomiDeliveryResult> {
  const leadIntakeResult = await deliverLeadToLeadIntake(lead);

  if (leadIntakeResult?.status === "sent") {
    return leadIntakeResult;
  }

  const apiKey = getApiKey();
  const from = getFromEmail();
  const to = getToEmail();

  if (!apiKey || !from || !to) {
    logWarn("lead.sendnomi.skipped", {
      sendNomiApiConfigured: Boolean(apiKey),
      sendNomiFromConfigured: Boolean(from),
      sendNomiToConfigured: Boolean(to)
    });
    return leadIntakeResult?.status === "failed" ? leadIntakeResult : { status: "skipped", reason: "missing_configuration" };
  }

  let lastFailure: { status: number; requestId: string | null; responsePreview: string; baseUrl: string } | null = null;

  for (const baseUrl of getApiBaseUrls()) {
    const response = await fetch(`${baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID()
      },
      body: JSON.stringify({
        from,
        to,
        subject: `ParkChargeEV yeni talep: ${lead.fullName}`,
        html: buildHtml(lead),
        text: buildText(lead)
      })
    });

    const requestId = response.headers.get("x-request-id");

    if (response.ok) {
      logInfo("lead.sendnomi.sent", {
        status: response.status,
        requestId,
        sendNomiApiBaseHost: new URL(baseUrl).host
      });

      return { status: "sent", requestId };
    }

    lastFailure = {
      status: response.status,
      requestId,
      responsePreview: await readResponsePreview(response),
      baseUrl
    };

    if (response.status !== 404) {
      break;
    }
  }

  logError("lead.sendnomi.delivery_failed", new Error(`SendNomi returned ${lastFailure?.status ?? "unknown"}`), {
    status: lastFailure?.status,
    requestId: lastFailure?.requestId,
    responsePreview: lastFailure?.responsePreview,
    sendNomiApiBaseHost: lastFailure ? new URL(lastFailure.baseUrl).host : undefined
  });

  return { status: "failed", reason: "request_failed", httpStatus: lastFailure?.status };
}
