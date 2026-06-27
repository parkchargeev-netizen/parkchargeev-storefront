import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
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
