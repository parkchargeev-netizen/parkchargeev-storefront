import { createHash } from "node:crypto";

import { absoluteUrl, siteConfig } from "@/lib/site";

type SendnomiLeadInput = {
  idempotencySource: string;
  fullName: string;
  company?: string | null;
  email: string;
  phone: string;
  city: string;
  reason: string;
  message: string;
  createdAt?: Date;
};

export class SendnomiDeliveryError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "SendnomiDeliveryError";
    this.status = status;
  }
}

function getSendnomiApiKey() {
  return process.env.SENDNOMI_API_KEY?.trim() ?? "";
}

export function hasSendnomiConfig() {
  return Boolean(getSendnomiApiKey());
}

function getSendnomiConfig() {
  const apiKey = getSendnomiApiKey();

  if (!apiKey) {
    throw new SendnomiDeliveryError("SendNomi API key is missing.");
  }

  const baseUrl = (
    process.env.SENDNOMI_API_BASE_URL?.trim() || "https://app.sendnomi.com/api"
  ).replace(/\/+$/g, "");
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || siteConfig.email;
  const from = process.env.SENDNOMI_FROM_EMAIL?.trim() || supportEmail;
  const to = process.env.SENDNOMI_TO_EMAIL?.trim() || supportEmail;

  return {
    apiKey,
    baseUrl,
    from,
    to
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPlainText(input: SendnomiLeadInput) {
  return [
    "ParkChargeEV iletişim formu",
    "",
    `Ad Soyad: ${input.fullName}`,
    `Firma / Site: ${input.company || "-"}`,
    `E-posta: ${input.email}`,
    `Telefon: ${input.phone}`,
    `Şehir: ${input.city}`,
    `Talep Tipi: ${input.reason}`,
    `Tarih: ${(input.createdAt ?? new Date()).toISOString()}`,
    "",
    "İhtiyaç Özeti:",
    input.message
  ].join("\n");
}

function formatHtml(input: SendnomiLeadInput) {
  const rows = [
    ["Ad Soyad", input.fullName],
    ["Firma / Site", input.company || "-"],
    ["E-posta", input.email],
    ["Telefon", input.phone],
    ["Şehir", input.city],
    ["Talep Tipi", input.reason],
    ["Tarih", (input.createdAt ?? new Date()).toLocaleString("tr-TR")]
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #dce9e3;color:#45615a;font-size:13px;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #dce9e3;color:#062f28;font-size:14px;font-weight:700;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f4fbf8;padding:24px;color:#062f28;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dce9e3;border-radius:16px;overflow:hidden;">
        <div style="background:#003f33;padding:22px 24px;color:#ffffff;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8ff3d2;">Yeni iletişim talebi</p>
          <h1 style="margin:0;font-size:24px;line-height:1.25;">ParkChargeEV form kaydı</h1>
        </div>
        <div style="padding:22px 24px;">
          <table style="width:100%;border-collapse:collapse;background:#fbfffd;border:1px solid #dce9e3;border-radius:12px;overflow:hidden;">
            <tbody>${tableRows}</tbody>
          </table>
          <div style="margin-top:20px;padding:18px;border-radius:12px;background:#edf8f4;border:1px solid #cce9df;">
            <p style="margin:0 0 8px;color:#45615a;font-size:13px;">İhtiyaç Özeti</p>
            <p style="margin:0;color:#062f28;font-size:15px;line-height:1.7;">${escapeHtml(input.message).replace(/\n/g, "<br />")}</p>
          </div>
          <p style="margin:18px 0 0;color:#6b7f79;font-size:12px;line-height:1.6;">
            Kaynak: ${escapeHtml(absoluteUrl("/iletisim"))}
          </p>
        </div>
      </div>
    </div>`;
}

function createIdempotencyKey(source: string) {
  const digest = createHash("sha256").update(source).digest("hex").slice(0, 32);
  return `parkchargeev-lead-${digest}`;
}

export async function sendLeadToSendnomi(input: SendnomiLeadInput) {
  const config = getSendnomiConfig();
  const response = await fetch(`${config.baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": createIdempotencyKey(input.idempotencySource)
    },
    body: JSON.stringify({
      from: config.from,
      to: config.to,
      subject: `ParkChargeEV iletişim talebi: ${input.reason}`,
      html: formatHtml(input),
      text: formatPlainText(input)
    })
  });

  if (!response.ok) {
    throw new SendnomiDeliveryError("SendNomi lead delivery failed.", response.status);
  }
}
