import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { z } from "zod";

import { getCustomerAuthConfig, hasDatabaseConfig } from "@/lib/runtime-config";
import { getDb } from "@/server/db/client";
import { customers } from "@/server/db/schema";
import { hashPassword, verifyPassword } from "@/server/auth/password";

const encoder = new TextEncoder();

export const customerLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(8)
});

export const customerRegisterSchema = customerLoginSchema.extend({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(10).max(32),
  marketingConsent: z.boolean().default(false)
});

export type CustomerSessionPayload = {
  sub: string;
  email: string;
  name: string;
};

function getSecretKey() {
  return encoder.encode(getCustomerAuthConfig().jwtSecret);
}

async function signCustomerSessionToken(payload: CustomerSessionPayload) {
  const { sessionTtlSeconds } = getCustomerAuthConfig();

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${sessionTtlSeconds}s`)
    .sign(getSecretKey());
}

async function verifyCustomerSessionToken(token: string) {
  const verified = await jwtVerify<CustomerSessionPayload>(token, getSecretKey());
  return verified.payload;
}

export async function setCustomerSessionCookie(payload: CustomerSessionPayload) {
  const cookieStore = await cookies();
  const { cookieName, sessionTtlSeconds } = getCustomerAuthConfig();
  const token = await signCustomerSessionToken(payload);

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(Date.now() + sessionTtlSeconds * 1000)
  });
}

export async function clearCustomerSessionCookie() {
  const cookieStore = await cookies();
  const { cookieName } = getCustomerAuthConfig();

  cookieStore.delete(cookieName);
}

export function expireCustomerSessionCookie(response: NextResponse) {
  const { cookieName } = getCustomerAuthConfig();

  response.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
    maxAge: 0
  });

  return response;
}

export async function getCustomerSessionFromCookies() {
  const cookieStore = await cookies();
  const { cookieName } = getCustomerAuthConfig();
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyCustomerSessionToken(token);
  } catch {
    return null;
  }
}

export async function loginCustomer(input: z.infer<typeof customerLoginSchema>) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.email, input.email.toLowerCase()))
    .limit(1);

  if (!customer?.passwordHash || !verifyPassword(input.password, customer.passwordHash)) {
    return null;
  }

  return customer;
}

export async function registerCustomer(input: z.infer<typeof customerRegisterSchema>) {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const normalizedEmail = input.email.toLowerCase();
  const [existingCustomer] = await db
    .select()
    .from(customers)
    .where(eq(customers.email, normalizedEmail))
    .limit(1);

  if (existingCustomer?.passwordHash) {
    return { customer: existingCustomer, alreadyRegistered: true };
  }

  if (existingCustomer) {
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        marketingConsent: input.marketingConsent,
        passwordHash: hashPassword(input.password)
      })
      .where(eq(customers.id, existingCustomer.id))
      .returning();

    return {
      customer: updatedCustomer ?? existingCustomer,
      alreadyRegistered: false
    };
  }

  const [createdCustomer] = await db
    .insert(customers)
    .values({
      email: normalizedEmail,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      marketingConsent: input.marketingConsent,
      passwordHash: hashPassword(input.password)
    })
    .returning();

  return {
    customer: createdCustomer ?? null,
    alreadyRegistered: false
  };
}
