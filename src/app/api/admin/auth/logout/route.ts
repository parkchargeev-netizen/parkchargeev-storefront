import { NextResponse } from "next/server";

import { getAdminAuthConfig } from "@/lib/runtime-config";
import { deleteAdminSession } from "@/server/admin/auth-service";
import { getAdminSessionFromCookies } from "@/server/auth/session";

export async function POST() {
  const session = await getAdminSessionFromCookies();

  if (session) {
    await deleteAdminSession(session.sid);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminAuthConfig().cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });

  return response;
}
