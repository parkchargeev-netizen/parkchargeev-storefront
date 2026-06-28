import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { canAccessAdminPath, type AdminRole } from "@/server/auth/authorization";

const encoder = new TextEncoder();
const checkoutConnectSources =
  "connect-src 'self' https://www.paytr.com https://o4511393003077632.ingest.de.sentry.io https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com https://google.com https://*.google.com.tr https://google.com.tr https://pagead2.googlesyndication.com https://www.googleadservices.com https://ad.doubleclick.net https://*.clarity.ms https://cloudflareinsights.com" +
  (process.env.NODE_ENV === "production" ? "" : " ws: http: https:");
const checkoutScriptSources =
  "'self' 'unsafe-inline' https://*.googletagmanager.com https://www.googleadservices.com https://www.google.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.clarity.ms https://scripts.clarity.ms https://*.clarity.ms https://www.paytr.com https://static.cloudflareinsights.com" +
  (process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'");
const checkoutContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self' https:",
  "frame-ancestors 'self' https://www.paytr.com https://*.paytr.com",
  "frame-src 'self' https:",
  "child-src 'self' https:",
  checkoutConnectSources,
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline'",
  `script-src ${checkoutScriptSources}`,
  `script-src-elem ${checkoutScriptSources}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self' data: blob: https:",
  "object-src 'none'",
  ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : [])
].join("; ");

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

async function verifyAdminJwt(token: string) {
  const secret = process.env.ADMIN_JWT_SECRET?.trim();

  if (!secret) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return null;
  }

  try {
    const header = JSON.parse(decodeBase64Url(encodedHeader)) as { alg?: string };

    if (header.alg !== "HS256") {
      return null;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256"
      },
      false,
      ["verify"]
    );

    const signature = Uint8Array.from(decodeBase64Url(encodedSignature), (character) =>
      character.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      encoder.encode(`${encodedHeader}.${encodedPayload}`)
    );

    if (!isValid) {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as {
      exp?: number;
      role?: AdminRole;
    };

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function applyAdminSecurityHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "same-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  return response;
}

function applyCustomerSecurityHeaders(
  response: NextResponse,
  options: { allowPaytrFrameAncestor?: boolean } = {}
) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  if (options.allowPaytrFrameAncestor) {
    response.headers.delete("X-Frame-Options");
    response.headers.set("Content-Security-Policy", checkoutContentSecurityPolicy);
  } else {
    response.headers.set("X-Frame-Options", "DENY");
  }
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "same-origin");
  response.headers.set(
    "Permissions-Policy",
    options.allowPaytrFrameAncestor
      ? 'camera=(), microphone=(), geolocation=(), payment=(self "https://www.paytr.com")'
      : "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  return response;
}

function getForbiddenResponse(message: string) {
  return applyAdminSecurityHeaders(
    NextResponse.json(
      {
        ok: false,
        message
      },
      { status: 403 }
    )
  );
}

function isUnsafeMethod(method: string) {
  return !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

function isLocalDevOriginPair(origin: string, expectedOrigin: string) {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const localOrigins = new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3100",
    "http://127.0.0.1:3100",
    "http://localhost:3025",
    "http://127.0.0.1:3025"
  ]);

  return localOrigins.has(origin) && localOrigins.has(expectedOrigin);
}

function isAllowedSameOrigin(origin: string, expectedOrigin: string) {
  return origin === expectedOrigin || isLocalDevOriginPair(origin, expectedOrigin);
}

function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  const expectedOrigin = request.nextUrl.origin;

  if (origin) {
    return isAllowedSameOrigin(origin, expectedOrigin);
  }

  const referer = request.headers.get("referer");

  if (!referer) {
    return true;
  }

  try {
    return isAllowedSameOrigin(new URL(referer).origin, expectedOrigin);
  } catch {
    return false;
  }
}

function getUnauthorizedResponse(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    return applyAdminSecurityHeaders(
      NextResponse.json(
        {
          ok: false,
          message: "Yetkisiz erişim."
        },
        { status: 401 }
      )
    );
  }

  if (request.nextUrl.pathname === "/admin") {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/admin/login";
    return applyAdminSecurityHeaders(NextResponse.rewrite(rewriteUrl));
  }

  const loginUrl = new URL("/admin", request.url);
  loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
  return applyAdminSecurityHeaders(NextResponse.redirect(loginUrl));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isCustomerPage = pathname === "/giris" || pathname === "/hesabim";
  const isCustomerApi = pathname.startsWith("/api/customer");
  const isCheckoutPage = pathname === "/odeme" || pathname === "/checkout";
  const isPaytrReturnPage = pathname === "/api/paytr/return";
  const isPaytrCheckoutApi =
    pathname === "/api/paytr/token" ||
    pathname === "/api/paytr/direct-form" ||
    pathname === "/api/checkout/create";
  const acceptHeader = request.headers.get("accept") ?? "";
  const isMarkdownRequest = request.method === "GET" && acceptHeader.includes("text/markdown");

  if (isMarkdownRequest && pathname.startsWith("/urun/")) {
    const slug = pathname.replace("/urun/", "");
    const url = request.nextUrl.clone();
    url.pathname = `/api/markdown/urun/${slug}`;
    return NextResponse.rewrite(url);
  }

  if (isMarkdownRequest && pathname.startsWith("/blog/")) {
    const slug = pathname.replace("/blog/", "");
    const url = request.nextUrl.clone();
    url.pathname = `/api/markdown/blog/${slug}`;
    return NextResponse.rewrite(url);
  }

  if (isCustomerApi && isUnsafeMethod(request.method) && !isSameOriginRequest(request)) {
    return applyCustomerSecurityHeaders(
      NextResponse.json(
        {
          ok: false,
          message: "Güvenlik doğrulaması başarısız oldu."
        },
        { status: 403 }
      )
    );
  }

  if (isPaytrCheckoutApi && isUnsafeMethod(request.method) && !isSameOriginRequest(request)) {
    return applyCustomerSecurityHeaders(
      NextResponse.json(
        {
          ok: false,
          message: "Güvenlik doğrulaması başarısız oldu."
        },
        { status: 403 }
      )
    );
  }

  if (isCustomerPage || isCustomerApi || isCheckoutPage || isPaytrReturnPage || isPaytrCheckoutApi) {
    return applyCustomerSecurityHeaders(NextResponse.next(), {
      allowPaytrFrameAncestor: isCheckoutPage || isPaytrReturnPage
    });
  }

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (isAdminApi && isUnsafeMethod(request.method) && !isSameOriginRequest(request)) {
    return getForbiddenResponse("Güvenlik doğrulaması başarısız oldu.");
  }

  if (pathname === "/admin/login") {
    return applyAdminSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
  }

  if (pathname === "/api/admin/auth/login") {
    return applyAdminSecurityHeaders(NextResponse.next());
  }

  const token = request.cookies.get("parkchargeev_admin_session")?.value;

  if (!token) {
    return getUnauthorizedResponse(request);
  }

  const payload = await verifyAdminJwt(token);

  if (!payload?.role) {
    return getUnauthorizedResponse(request);
  }

  if (!canAccessAdminPath(payload.role, pathname.replace("/api", ""))) {
    return applyAdminSecurityHeaders(
      NextResponse.json(
        {
          ok: false,
          message: "Bu alana erişim yetkiniz yok."
        },
        { status: 403 }
      )
    );
  }

  return applyAdminSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/customer/:path*",
    "/api/paytr/token",
    "/api/paytr/direct-form",
    "/api/paytr/return",
    "/api/checkout/create",
    "/giris",
    "/hesabim",
    "/odeme",
    "/checkout",
    "/urun/:path*",
    "/blog/:path*"
  ]
};
