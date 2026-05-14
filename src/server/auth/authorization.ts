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
    prefix: "/admin/erisim",
    roles: ["superadmin", "sales", "operations", "technician", "editor"]
  },
  {
    prefix: "/admin/site",
    roles: ["superadmin", "editor"]
  },
  {
    prefix: "/admin/urunler",
    roles: ["superadmin", "sales"]
  },
  {
    prefix: "/admin/products",
    roles: ["superadmin", "sales"]
  },
  {
    prefix: "/admin/siparisler",
    roles: ["superadmin", "sales"]
  },
  {
    prefix: "/admin/orders",
    roles: ["superadmin", "sales"]
  },
  {
    prefix: "/admin/teklifler",
    roles: ["superadmin", "sales"]
  },
  {
    prefix: "/admin/quotes",
    roles: ["superadmin", "sales"]
  },
  {
    prefix: "/admin/blog",
    roles: ["superadmin", "editor"]
  },
  {
    prefix: "/admin/saha",
    roles: ["superadmin", "operations", "technician"]
  },
  {
    prefix: "/admin/istasyonlar",
    roles: ["superadmin", "operations", "technician"]
  },
  {
    prefix: "/admin/service-leads",
    roles: ["superadmin", "operations", "technician"]
  },
  {
    prefix: "/admin/stations",
    roles: ["superadmin", "operations", "technician"]
  },
  {
    prefix: "/admin/search",
    roles: ["superadmin", "sales", "operations", "technician", "editor"]
  },
  {
    prefix: "/admin/katalog",
    roles: ["superadmin", "sales"]
  },
  {
    prefix: "/admin/paytr",
    roles: ["superadmin", "sales"]
  },
  {
    prefix: "/admin/audit",
    roles: ["superadmin"]
  },
  {
    prefix: "/admin/adminler",
    roles: ["superadmin"]
  },
  {
    prefix: "/admin/users",
    roles: ["superadmin"]
  },
  {
    prefix: "/admin/media",
    roles: ["superadmin", "sales", "editor"]
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
