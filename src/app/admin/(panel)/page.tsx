import { AdminDashboardView } from "@/components/admin/dashboard/admin-dashboard-view";
import { hasDatabaseConfig } from "@/lib/runtime-config";
import { getAdminDashboardSnapshot } from "@/server/admin/dashboard";
import { requireAdminRole } from "@/server/auth/guards";

export default async function AdminDashboardPage() {
  const [snapshot, authenticatedAdmin] = await Promise.all([
    getAdminDashboardSnapshot(),
    requireAdminRole()
  ]);

  const paytrReady = Boolean(
    process.env.PAYTR_MERCHANT_ID?.trim() &&
      process.env.PAYTR_MERCHANT_KEY?.trim() &&
      process.env.PAYTR_MERCHANT_SALT?.trim()
  );

  return (
    <AdminDashboardView
      snapshot={snapshot}
      role={authenticatedAdmin?.session.role}
      databaseEnabled={hasDatabaseConfig()}
      paytrReady={paytrReady}
    />
  );
}
