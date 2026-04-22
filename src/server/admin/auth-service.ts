import { and, count, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { getDb } from "@/server/db/client";
import { adminSessions, adminUsers } from "@/server/db/schema";
import { hashPassword } from "@/server/auth/password";

export async function ensureBootstrapAdmin() {
  const db = getDb();
  const [existingCount] = await db.select({ count: count() }).from(adminUsers);

  if ((existingCount?.count ?? 0) > 0) {
    return;
  }

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  const fullName =
    process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "ParkChargeEV Superadmin";

  if (!email || !password) {
    return;
  }

  await db.insert(adminUsers).values({
    email,
    fullName,
    role: "superadmin",
    status: "active",
    passwordHash: hashPassword(password)
  });
}

export async function findAdminByEmail(email: string) {
  const db = getDb();
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1);

  return admin ?? null;
}

export async function findAdminById(id: string) {
  const db = getDb();
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);

  return admin ?? null;
}

export async function createAdminSessionRecord(input: {
  adminUserId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
}) {
  const db = getDb();
  const tokenId = randomUUID();

  await db.insert(adminSessions).values({
    adminUserId: input.adminUserId,
    tokenId,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    expiresAt: input.expiresAt
  });

  await db
    .update(adminUsers)
    .set({
      lastLoginAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(adminUsers.id, input.adminUserId));

  return tokenId;
}

export async function getAdminSessionRecord(tokenId: string, adminUserId: string) {
  const db = getDb();
  const [session] = await db
    .select()
    .from(adminSessions)
    .where(
      and(eq(adminSessions.tokenId, tokenId), eq(adminSessions.adminUserId, adminUserId))
    )
    .orderBy(desc(adminSessions.createdAt))
    .limit(1);

  return session ?? null;
}

export async function touchAdminSession(tokenId: string) {
  const db = getDb();

  await db
    .update(adminSessions)
    .set({
      lastSeenAt: new Date()
    })
    .where(eq(adminSessions.tokenId, tokenId));
}

export async function deleteAdminSession(tokenId: string) {
  const db = getDb();
  await db.delete(adminSessions).where(eq(adminSessions.tokenId, tokenId));
}

export async function listAssignableAdmins() {
  const db = getDb();

  return db
    .select({
      id: adminUsers.id,
      fullName: adminUsers.fullName,
      email: adminUsers.email,
      role: adminUsers.role
    })
    .from(adminUsers)
    .where(eq(adminUsers.status, "active"))
    .orderBy(adminUsers.fullName);
}
