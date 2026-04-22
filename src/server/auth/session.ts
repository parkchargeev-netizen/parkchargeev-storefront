import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { getAdminAuthConfig } from "@/lib/runtime-config";
import type { AdminRole } from "@/server/auth/authorization";

const encoder = new TextEncoder();

export type AdminSessionPayload = {
  sub: string;
  sid: string;
  email: string;
  name: string;
  role: AdminRole;
};

function getSecretKey() {
  const { jwtSecret } = getAdminAuthConfig();
  return encoder.encode(jwtSecret);
}

export async function signAdminSessionToken(payload: AdminSessionPayload) {
  const { sessionTtlSeconds } = getAdminAuthConfig();

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${sessionTtlSeconds}s`)
    .sign(getSecretKey());
}

export async function verifyAdminSessionToken(token: string) {
  const verified = await jwtVerify<AdminSessionPayload>(token, getSecretKey());
  return verified.payload;
}

export async function getAdminSessionFromCookies() {
  const cookieStore = await cookies();
  const { cookieName } = getAdminAuthConfig();
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyAdminSessionToken(token);
  } catch {
    return null;
  }
}
