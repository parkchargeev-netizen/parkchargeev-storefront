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

const DEFAULT_API_BASE_URL = "https://api.sendnomi.com";
const DEFAULT_TO_EMAIL = "parkchargeev@gmail.com";

function getApiBaseUrl() {
  const configuredBaseUrl = process.env.SENDNOMI_API_BASE_URL?.trim();
  return (configuredBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

function getToEmail() {
  return process.env.SENDNOMI_TO_EMAIL?.trim() || DEFAULT_TO_EMAIL;
}

function getFromEmail() {
  return process.env.SENDNOMI_FROM_EMAIL?.trim() || "";
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
    ["?ehir", lead.city],
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
          <p style="margin:0 0 8px;color:#48625b;font-size:13px;font-weight:700;">?htiya? ?zeti</p>
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
    `?ehir: ${lead.city}`,
    `Talep tipi: ${lead.reason}`,
    `G\u00f6nderim zaman\u0131: ${lead.createdAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
    "",
    "?htiya? ?zeti:",
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

export async function deliverLeadToSendNomi(lead: SendNomiLead): Promise<SendNomiDeliveryResult> {
  const apiKey = getApiKey();
  const from = getFromEmail();
  const to = getToEmail();

  if (!apiKey || !from || !to) {
    logWarn("lead.sendnomi.skipped", {
      hasSendNomiApiKey: Boolean(apiKey),
      hasSendNomiFromEmail: Boolean(from),
      hasSendNomiToEmail: Boolean(to)
    });
    return { status: "skipped", reason: "missing_configuration" };
  }

  const response = await fetch(`${getApiBaseUrl()}/v1/messages`, {
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

  if (!response.ok) {
    logError("lead.sendnomi.delivery_failed", new Error(`SendNomi returned ${response.status}`), {
      status: response.status,
      requestId,
      responsePreview: await readResponsePreview(response)
    });
    return { status: "failed", reason: "request_failed", httpStatus: response.status };
  }

  logInfo("lead.sendnomi.sent", {
    status: response.status,
    requestId
  });

  return { status: "sent", requestId };
}
