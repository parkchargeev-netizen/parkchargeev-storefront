import type { adminRoleEnum } from "@/server/db/schema";

export type AdminRole = (typeof adminRoleEnum.enumValues)[number];

const defaultRoles: AdminRole[] = [
  "superadmin",
  "sales",
  "operations",
  "technician",
  "editor"
];

const routeRoleMap: Array<{
  prefix: string;
  roles: AdminRole[];
}> = [
  {
    prefix: "/admin/urunler",
    roles: ["superadmin", "sales"]
  },
  {
    prefix: "/admin/siparisler",
    roles: ["superadmin", "sales"]
  },
  {
    prefix: "/admin/teklifler",
    roles: ["superadmin", "sales"]
  },
  {
    prefix: "/admin/blog",
    roles: ["superadmin", "editor"]
  },
  {
    prefix: "/admin/saha",
    roles: ["superadmin", "operations", "technician"]
  }
];

export function getAllowedRolesForPath(pathname: string) {
  const matchedRule = routeRoleMap.find((rule) => pathname.startsWith(rule.prefix));
  return matchedRule?.roles ?? defaultRoles;
}

export function hasRequiredRole(role: AdminRole, allowedRoles: AdminRole[]) {
  return allowedRoles.includes(role);
}

export function canAccessAdminPath(role: AdminRole, pathname: string) {
  return hasRequiredRole(role, getAllowedRolesForPath(pathname));
}
