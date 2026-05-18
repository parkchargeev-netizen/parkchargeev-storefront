import { headers } from "next/headers";
import { cache } from "react";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { logWarn } from "@/lib/server-logger";
import {
  ensureBootstrapAdmin,
  getAdminAuthRecord,
  getBootstrapAdmin,
  touchAdminSession
} from "@/server/admin/auth-service";
import { canAccessAdminPath, hasRequiredRole, type AdminRole } from "@/server/auth/authorization";
import { getAdminSessionFromCookies } from "@/server/auth/session";

const sessionTouchThrottleMs = 5 * 60 * 1000;

function getBootstrapAuthenticatedAdmin(session: Awaited<ReturnType<typeof getAdminSessionFromCookies>>) {
  if (!session) {
    return null;
  }

  const bootstrapAdmin = getBootstrapAdmin();

  if (
    !bootstrapAdmin ||
    session.sub !== bootstrapAdmin.id ||
    session.email !== bootstrapAdmin.email ||
    session.role !== bootstrapAdmin.role
  ) {
    return null;
  }

  return {
    session,
    admin: {
      id: bootstrapAdmin.id,
      email: bootstrapAdmin.email,
      fullName: bootstrapAdmin.fullName,
      role: bootstrapAdmin.role,
      status: bootstrapAdmin.status
    }
  };
}

export const getAuthenticatedAdmin = cache(async function getAuthenticatedAdmin() {
  const session = await getAdminSessionFromCookies();

  if (!session) {
    return null;
  }

  if (!hasDatabaseConfig()) {
    return getBootstrapAuthenticatedAdmin(session);
  }

  if (session.sid === "bootstrap-session") {
    const bootstrapAuth = getBootstrapAuthenticatedAdmin(session);

    if (!bootstrapAuth) {
      return null;
    }

    const syncedAdmin = await ensureBootstrapAdmin().catch((error) => {
      logWarn("admin.auth.bootstrap_session_sync_failed", {
        message: error instanceof Error ? error.message : String(error)
      });
      return null;
    });

    if (!syncedAdmin) {
      return bootstrapAuth;
    }

    return {
      session: {
        ...session,
        sub: syncedAdmin.id,
        email: syncedAdmin.email,
        name: syncedAdmin.fullName,
        role: syncedAdmin.role
      },
      admin: {
        id: syncedAdmin.id,
        email: syncedAdmin.email,
        fullName: syncedAdmin.fullName,
        role: syncedAdmin.role,
        status: syncedAdmin.status
      }
    };
  }

  const authRecord = await getAdminAuthRecord(session.sid, session.sub);
  const admin = authRecord?.admin ?? null;
  const sessionRecord = authRecord?.sessionRecord ?? null;

  if (!admin || admin.status !== "active" || !sessionRecord) {
    return null;
  }

  if (sessionRecord.expiresAt <= new Date()) {
    return null;
  }

  if (sessionRecord.lastSeenAt.getTime() < Date.now() - sessionTouchThrottleMs) {
    await touchAdminSession(session.sid);
  }

  return {
    session,
    admin
  };
});

export async function requireAdminRole(allowedRoles?: AdminRole[]) {
  const authenticatedAdmin = await getAuthenticatedAdmin();

  if (!authenticatedAdmin) {
    return null;
  }

  if (allowedRoles && !hasRequiredRole(authenticatedAdmin.session.role, allowedRoles)) {
    return null;
  }

  return authenticatedAdmin;
}

export async function getRequestMeta() {
  const headerStore = await headers();

  return {
    ipAddress:
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      null,
    userAgent: headerStore.get("user-agent")
  };
}

export function canSessionAccessPath(role: AdminRole, pathname: string) {
  return canAccessAdminPath(role, pathname);
}
