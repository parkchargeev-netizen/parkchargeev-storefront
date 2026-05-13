import { and, count, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import {
  bootstrapAdminId,
  fallbackAssignableAdminSeeds
} from "@/server/admin/fallback-constants";
import { getDb } from "@/server/db/client";
import { adminSessions, adminUsers } from "@/server/db/schema";
import { hashPassword, verifyPassword } from "@/server/auth/password";

type AdminUserRecord = typeof adminUsers.$inferSelect;

const bootstrapEnsureCacheMs = 5 * 60 * 1000;
let bootstrapEnsurePromise: Promise<AdminUserRecord | null> | null = null;
let bootstrapEnsureResolvedAt = 0;

export function getBootstrapAdmin() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  const fullName =
    process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "ParkChargeEV Süper Admin";

  if (!email || !password) {
    return null;
  }

  return {
    id: bootstrapAdminId,
    email,
    password,
    fullName,
    role: "superadmin" as const,
    status: "active" as const
  };
}

export function authenticateBootstrapAdmin(email: string, password: string) {
  const bootstrapAdmin = getBootstrapAdmin();

  if (!bootstrapAdmin) {
    return null;
  }

  if (
    bootstrapAdmin.email !== email.trim().toLowerCase() ||
    bootstrapAdmin.password !== password
  ) {
    return null;
  }

  return bootstrapAdmin;
}

async function ensureBootstrapAdminUncached() {
  if (!hasDatabaseConfig()) {
    return null;
  }

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  const fullName =
    process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "ParkChargeEV Süper Admin";

  if (!email || !password) {
    return null;
  }

  const db = getDb();
  const normalizedEmail = email.toLowerCase();
  const [existingAdmin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, normalizedEmail))
    .limit(1);

  if (existingAdmin) {
    const passwordChanged = !verifyPassword(password, existingAdmin.passwordHash);
    const profileChanged =
      existingAdmin.fullName !== fullName ||
      existingAdmin.role !== "superadmin" ||
      existingAdmin.status !== "active";

    if (passwordChanged || profileChanged) {
      const [updatedAdmin] = await db
        .update(adminUsers)
        .set({
          fullName,
          role: "superadmin",
          status: "active",
          ...(passwordChanged ? { passwordHash: hashPassword(password) } : {}),
          updatedAt: new Date()
        })
        .where(eq(adminUsers.id, existingAdmin.id))
        .returning();

      if (passwordChanged) {
        await db.delete(adminSessions).where(eq(adminSessions.adminUserId, existingAdmin.id));
      }

      return updatedAdmin ?? existingAdmin;
    }

    return existingAdmin;
  }

  const [createdAdmin] = await db
    .insert(adminUsers)
    .values({
      email: normalizedEmail,
      fullName,
      role: "superadmin",
      status: "active",
      passwordHash: hashPassword(password)
    })
    .returning();

  return createdAdmin ?? null;
}

export async function ensureBootstrapAdmin() {
  const now = Date.now();

  if (bootstrapEnsurePromise && now - bootstrapEnsureResolvedAt < bootstrapEnsureCacheMs) {
    return bootstrapEnsurePromise;
  }

  bootstrapEnsurePromise = ensureBootstrapAdminUncached()
    .then((admin) => {
      bootstrapEnsureResolvedAt = Date.now();
      return admin;
    })
    .catch((error) => {
      bootstrapEnsurePromise = null;
      throw error;
    });

  return bootstrapEnsurePromise;
}

export async function findAdminByEmail(email: string) {
  if (!hasDatabaseConfig()) {
    const bootstrapAdmin = getBootstrapAdmin();

    if (bootstrapAdmin && bootstrapAdmin.email === email.toLowerCase()) {
      return {
        id: bootstrapAdmin.id,
        email: bootstrapAdmin.email,
        fullName: bootstrapAdmin.fullName,
        role: bootstrapAdmin.role,
        status: bootstrapAdmin.status,
        passwordHash: hashPassword(bootstrapAdmin.password)
      };
    }

    return null;
  }

  const db = getDb();
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1);

  return admin ?? null;
}

export async function findAdminById(id: string) {
  if (!hasDatabaseConfig()) {
    const bootstrapAdmin = getBootstrapAdmin();

    if (bootstrapAdmin && bootstrapAdmin.id === id) {
      return {
        id: bootstrapAdmin.id,
        email: bootstrapAdmin.email,
        fullName: bootstrapAdmin.fullName,
        role: bootstrapAdmin.role,
        status: bootstrapAdmin.status
      };
    }

    return null;
  }

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

  await Promise.all([
    db.insert(adminSessions).values({
      adminUserId: input.adminUserId,
      tokenId,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      expiresAt: input.expiresAt
    }),
    db
      .update(adminUsers)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(adminUsers.id, input.adminUserId))
      .catch((error) => {
        console.warn("Admin last login timestamp could not be updated.", error);
      })
  ]);

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

export async function getAdminAuthRecord(tokenId: string, adminUserId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      adminId: adminUsers.id,
      email: adminUsers.email,
      fullName: adminUsers.fullName,
      role: adminUsers.role,
      status: adminUsers.status,
      phone: adminUsers.phone,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
      sessionId: adminSessions.id,
      sessionTokenId: adminSessions.tokenId,
      sessionAdminUserId: adminSessions.adminUserId,
      ipAddress: adminSessions.ipAddress,
      userAgent: adminSessions.userAgent,
      expiresAt: adminSessions.expiresAt,
      lastSeenAt: adminSessions.lastSeenAt,
      sessionCreatedAt: adminSessions.createdAt
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.adminUserId))
    .where(
      and(eq(adminSessions.tokenId, tokenId), eq(adminSessions.adminUserId, adminUserId))
    )
    .orderBy(desc(adminSessions.createdAt))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    admin: {
      id: row.adminId,
      email: row.email,
      fullName: row.fullName,
      role: row.role,
      status: row.status,
      phone: row.phone,
      lastLoginAt: row.lastLoginAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    },
    sessionRecord: {
      id: row.sessionId,
      adminUserId: row.sessionAdminUserId,
      tokenId: row.sessionTokenId,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      expiresAt: row.expiresAt,
      lastSeenAt: row.lastSeenAt,
      createdAt: row.sessionCreatedAt
    }
  };
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
  if (!hasDatabaseConfig()) {
    return;
  }

  const db = getDb();
  await db.delete(adminSessions).where(eq(adminSessions.tokenId, tokenId));
}

export async function listAssignableAdmins() {
  if (!hasDatabaseConfig()) {
    const bootstrapAdmin = getBootstrapAdmin();

    return [
      ...(bootstrapAdmin
        ? [
            {
              id: bootstrapAdmin.id,
              fullName: bootstrapAdmin.fullName,
              email: bootstrapAdmin.email,
              role: bootstrapAdmin.role
            }
          ]
        : []),
      ...fallbackAssignableAdminSeeds.map((admin) => ({
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role
      }))
    ];
  }

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
