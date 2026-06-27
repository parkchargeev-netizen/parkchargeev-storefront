import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { durationSince, logError, logInfo } from "@/lib/server-logger";
import { getDb } from "@/server/db/client";
import { orderStatusHistory, orders, paytrTransactions } from "@/server/db/schema";

type PaytrReturnStatus = "success" | "failed";

function normalizeStatus(value: string | null): PaytrReturnStatus {
  return value === "success" ? "success" : "failed";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeMerchantOid(value: string | null) {
  return (value ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);
}

function buildReturnHtml({
  merchantOid,
  origin,
  status
}: {
  merchantOid: string;
  origin: string;
  status: PaytrReturnStatus;
}) {
  const checkoutUrl = `/checkout?status=${status}&oid=${encodeURIComponent(merchantOid)}`;
  const title =
    status === "success"
      ? "Odeme sonucu alindi"
      : "Odeme sonucu kontrol ediliyor";
  const description =
    status === "success"
      ? "Odeme donusu alindi. Kesin sonuc PayTR bildirimiyle dogrulaniyor."
      : "Odeme tamamlanamadi veya banka dogrulamasi reddedildi.";
  const messagePayload = JSON.stringify({
    source: "parkchargeev-paytr-return",
    type: "paytr_return",
    status,
    merchantOid
  });

  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { color-scheme: light; font-family: Inter, Arial, sans-serif; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #f4fffb, #e9f7ff);
        color: #06231c;
      }
      main {
        width: min(92vw, 30rem);
        border: 1px solid rgba(6, 51, 38, 0.12);
        border-radius: 14px;
        padding: 1.25rem;
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 18px 48px rgba(6, 51, 38, 0.12);
      }
      h1 { margin: 0; font-size: 1rem; line-height: 1.4; }
      p { margin: 0.55rem 0 0; color: #45625a; font-size: 0.9rem; line-height: 1.6; }
      a { display: inline-flex; margin-top: 1rem; color: #063326; font-weight: 700; }
    </style>
    <script>
      (function () {
        var payload = ${messagePayload};
        var checkoutUrl = ${JSON.stringify(checkoutUrl)};
        var origin = ${JSON.stringify(origin)};
        try {
          window.parent.postMessage(payload, origin);
        } catch (error) {}
        window.setTimeout(function () {
          try {
            if (window.top && window.top !== window.self) {
              window.top.location.replace(checkoutUrl);
              return;
            }

            if (window.top === window.self) {
              window.location.replace(checkoutUrl);
            }
          } catch (error) {
            window.location.replace(checkoutUrl);
          }
        }, 900);
      })();
    </script>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      <p>Siparis no: ${escapeHtml(merchantOid || "-")}</p>
      <a href="${escapeHtml(checkoutUrl)}" target="_top" rel="noopener">Odeme durumunu gor</a>
    </main>
  </body>
</html>`;
}

async function recordFailedReturn(merchantOid: string, startedAt: number) {
  if (!merchantOid) {
    return;
  }

  try {
    const db = getDb();
    const [order] = await db
      .select({
        id: orders.id,
        status: orders.status,
        paymentStatus: orders.paymentStatus
      })
      .from(orders)
      .where(eq(orders.merchantOid, merchantOid))
      .limit(1);

    if (!order || order.paymentStatus === "paid") {
      return;
    }

    const [transaction] = await db
      .select({
        id: paytrTransactions.id,
        status: paytrTransactions.status
      })
      .from(paytrTransactions)
      .where(eq(paytrTransactions.merchantOid, merchantOid))
      .limit(1);

    if (transaction?.status === "callback_success") {
      return;
    }

    const now = new Date();
    const statusNote =
      "PayTR basarisiz odeme donusu alindi. PayTR callback gelmezse panelden islem durumunu kontrol edin.";

    await db.transaction(async (tx) => {
      if (transaction) {
        await tx
          .update(paytrTransactions)
          .set({
            status: "callback_failed",
            rawCallback: {
              source: "paytr_return",
              status: "failed",
              merchant_oid: merchantOid
            },
            updatedAt: now
          })
          .where(eq(paytrTransactions.id, transaction.id));
      }

      await tx
        .update(orders)
        .set({
          status: "payment_failed",
          paymentStatus: "failed",
          statusNote,
          paytrLastSyncedAt: now,
          updatedAt: now
        })
        .where(eq(orders.id, order.id));

      if (order.status !== "payment_failed" || order.paymentStatus !== "failed") {
        await tx.insert(orderStatusHistory).values({
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "payment_failed",
          note: statusNote
        });
      }
    });

    logInfo("paytr.return.failed_recorded", {
      merchantOid,
      durationMs: durationSince(startedAt)
    });
  } catch (error) {
    logError("paytr.return.failed_record_error", error, {
      merchantOid,
      durationMs: durationSince(startedAt)
    });
  }
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const url = new URL(request.url);
  const status = normalizeStatus(url.searchParams.get("status"));
  const merchantOid = safeMerchantOid(url.searchParams.get("oid"));
  const csp = [
    "default-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'self' https://www.paytr.com https://*.paytr.com",
    "script-src 'unsafe-inline'",
    "style-src 'unsafe-inline'",
    "img-src data:",
    "form-action 'none'",
    "object-src 'none'"
  ].join("; ");

  if (status === "failed") {
    await recordFailedReturn(merchantOid, startedAt);
  }

  return new NextResponse(
    buildReturnHtml({
      merchantOid,
      origin: url.origin,
      status
    }),
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Security-Policy": csp,
        "Content-Type": "text/html; charset=utf-8",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow"
      }
    }
  );
}
