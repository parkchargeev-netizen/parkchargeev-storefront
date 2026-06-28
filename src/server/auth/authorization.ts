import type { adminRoleEnum } from "@/server/db/schema";

export type AdminRole = (typeof adminRoleEnum.enumValues)[number];
export type LegacyAdminRole = "sales" | "operations" | "technician" | "editor";
export type AnyAdminRole = AdminRole | LegacyAdminRole;

export type AdminPermission =
  | "dashboard:read"
  | "access:read"
  | "site:read"
  | "site:write"
  | "product:read"
  | "product:write"
  | "product:delete"
  | "inventory:read"
  | "inventory:write"
  | "order:read"
  | "order:write"
  | "quote:read"
  | "quote:write"
  | "service:read"
  | "service:write"
  | "content:read"
  | "content:write"
  | "catalog:read"
  | "catalog:write"
  | "payment:read"
  | "payment:write"
  | "notification:read"
  | "notification:write"
  | "risk:read"
  | "audit:read"
  | "user:read"
  | "user:write"
  | "media:write";

const allPermissions: AdminPermission[] = [
  "dashboard:read",
  "access:read",
  "site:read",
  "site:write",
  "product:read",
  "product:write",
  "product:delete",
  "inventory:read",
  "inventory:write",
  "order:read",
  "order:write",
  "quote:read",
  "quote:write",
  "service:read",
  "service:write",
  "content:read",
  "content:write",
  "catalog:read",
  "catalog:write",
  "payment:read",
  "payment:write",
  "notification:read",
  "notification:write",
  "risk:read",
  "audit:read",
  "user:read",
  "user:write",
  "media:write"
];

const adminPermissions: AdminPermission[] = allPermissions.filter(
  (permission) => permission !== "user:write"
);

const rolePermissionMap: Record<AdminRole, AdminPermission[]> = {
  superadmin: allPermissions,
  admin: adminPermissions,
  product_manager: [
    "dashboard:read",
    "access:read",
    "product:read",
    "product:write",
    "product:delete",
    "inventory:read",
    "inventory:write",
    "catalog:read",
    "catalog:write",
    "content:read",
    "media:write",
    "risk:read",
    "notification:read",
    "notification:write"
  ],
  order_manager: [
    "dashboard:read",
    "access:read",
    "order:read",
    "order:write",
    "quote:read",
    "quote:write",
    "service:read",
    "service:write",
    "payment:read",
    "payment:write",
    "inventory:read",
    "risk:read",
    "notification:read",
    "notification:write"
  ],
  support_agent: [
    "dashboard:read",
    "access:read",
    "service:read",
    "service:write",
    "quote:read",
    "order:read",
    "notification:read",
    "risk:read"
  ],
  readonly: [
    "dashboard:read",
    "access:read",
    "site:read",
    "product:read",
    "inventory:read",
    "order:read",
    "quote:read",
    "service:read",
    "content:read",
    "catalog:read",
    "payment:read",
    "notification:read",
    "risk:read",
    "audit:read",
    "user:read"
  ]
};

const routePermissionMap: Array<{
  prefix: string;
  permission: AdminPermission;
}> = [
  { prefix: "/admin/erisim", permission: "access:read" },
  { prefix: "/admin/site", permission: "site:read" },
  { prefix: "/admin/urunler", permission: "product:read" },
  { prefix: "/admin/products", permission: "product:read" },
  { prefix: "/admin/envanter", permission: "inventory:read" },
  { prefix: "/admin/inventory", permission: "inventory:read" },
  { prefix: "/admin/banners", permission: "product:read" },
  { prefix: "/admin/kampanyalar", permission: "product:read" },
  { prefix: "/admin/campaigns", permission: "product:read" },
  { prefix: "/admin/merchandising", permission: "product:read" },
  { prefix: "/admin/siparisler", permission: "order:read" },
  { prefix: "/admin/orders", permission: "order:read" },
  { prefix: "/admin/teklifler", permission: "quote:read" },
  { prefix: "/admin/quotes", permission: "quote:read" },
  { prefix: "/admin/blog", permission: "content:read" },
  { prefix: "/admin/saha", permission: "service:read" },
  { prefix: "/admin/service-leads", permission: "service:read" },
  { prefix: "/admin/search", permission: "dashboard:read" },
  { prefix: "/admin/katalog", permission: "catalog:read" },
  { prefix: "/admin/paytr", permission: "payment:read" },
  { prefix: "/admin/bildirimler", permission: "notification:read" },
  { prefix: "/admin/notifications", permission: "notification:read" },
  { prefix: "/admin/risk", permission: "risk:read" },
  { prefix: "/admin/audit", permission: "audit:read" },
  { prefix: "/admin/adminler", permission: "user:read" },
  { prefix: "/admin/users", permission: "user:read" },
  { prefix: "/admin/media", permission: "media:write" }
];

const legacyRoleMap: Record<LegacyAdminRole, AdminRole> = {
  sales: "admin",
  operations: "order_manager",
  technician: "support_agent",
  editor: "admin"
};

export function normalizeAdminRole(role: AnyAdminRole): AdminRole {
  return role in legacyRoleMap ? legacyRoleMap[role as LegacyAdminRole] : (role as AdminRole);
}

export function getPermissionsForRole(role: AnyAdminRole) {
  return rolePermissionMap[normalizeAdminRole(role)] ?? [];
}

export function hasPermission(role: AnyAdminRole, permission: AdminPermission) {
  return getPermissionsForRole(role).includes(permission);
}

export function getPermissionForPath(pathname: string) {
  const matchedRule = routePermissionMap.find((rule) => pathname.startsWith(rule.prefix));
  return matchedRule?.permission ?? "dashboard:read";
}

export function getAllowedRolesForPath(pathname: string) {
  const permission = getPermissionForPath(pathname);
  return (Object.keys(rolePermissionMap) as AdminRole[]).filter((role) =>
    hasPermission(role, permission)
  );
}

export function hasRequiredRole(role: AnyAdminRole, allowedRoles: AnyAdminRole[]) {
  const normalizedRole = normalizeAdminRole(role);
  const normalizedAllowedRoles = allowedRoles.map(normalizeAdminRole);
  return normalizedAllowedRoles.includes(normalizedRole);
}

export function canAccessAdminPath(role: AnyAdminRole, pathname: string) {
  return hasPermission(role, getPermissionForPath(pathname));
}

export { rolePermissionMap };
