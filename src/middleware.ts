import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { canAccessAdminPath, type AdminRole } from "@/server/auth/authorization";

const encoder = new TextEncoder();

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

function getUnauthorizedResponse(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    return NextResponse.json(
      {
        ok: false,
        message: "Yetkisiz erisim."
      },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
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

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login" || pathname === "/api/admin/auth/login") {
    return NextResponse.next();
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
    return NextResponse.json(
      {
        ok: false,
        message: "Bu alana erisim yetkiniz yok."
      },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/urun/:path*", "/blog/:path*"]
};
