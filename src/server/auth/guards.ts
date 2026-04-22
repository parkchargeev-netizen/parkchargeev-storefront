import { headers } from "next/headers";

import { canAccessAdminPath, hasRequiredRole, type AdminRole } from "@/server/auth/authorization";
import { getAdminSessionFromCookies } from "@/server/auth/session";
import { findAdminById, getAdminSessionRecord, touchAdminSession } from "@/server/admin/auth-service";

export async function getAuthenticatedAdmin() {
  const session = await getAdminSessionFromCookies();

  if (!session) {
    return null;
  }

  const [admin, sessionRecord] = await Promise.all([
    findAdminById(session.sub),
    getAdminSessionRecord(session.sid, session.sub)
  ]);

  if (!admin || admin.status !== "active" || !sessionRecord) {
    return null;
  }

  if (sessionRecord.expiresAt <= new Date()) {
    return null;
  }

  await touchAdminSession(session.sid);

  return {
    session,
    admin
  };
}

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
