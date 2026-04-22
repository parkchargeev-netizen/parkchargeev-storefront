import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { hasDatabaseConfig } from "@/lib/runtime-config";
import { requireAdminRole } from "@/server/auth/guards";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const authenticatedAdmin = await requireAdminRole();

  if (!authenticatedAdmin) {
    redirect("/admin/login");
  }

  return (
    <AdminShell
      admin={{
        fullName: authenticatedAdmin.admin.fullName,
        email: authenticatedAdmin.admin.email,
        role: authenticatedAdmin.admin.role
      }}
      databaseEnabled={hasDatabaseConfig()}
    >
      {children}
    </AdminShell>
  );
}
