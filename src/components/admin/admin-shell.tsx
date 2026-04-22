import Link from "next/link";
import type { ReactNode } from "react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { adminNavigation, adminRoleLabels } from "@/server/admin/constants";
import type { AdminRole } from "@/server/auth/authorization";

type AdminShellProps = {
  admin: {
    fullName: string;
    email: string;
    role: AdminRole;
  };
  children: ReactNode;
};

export function AdminShell({ admin, children }: AdminShellProps) {
  const items = adminNavigation.filter((item) => item.roles.includes(admin.role));

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="surface-card sticky top-4 h-fit border border-slate-200 bg-white/95 p-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              ParkChargeEV Admin
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">Operasyon Paneli</h1>
            <p className="text-sm text-slate-600">
              Satis, teklif ve siparis operasyonlari tek panelde.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{admin.fullName}</p>
            <p className="mt-1 text-sm text-slate-600">{admin.email}</p>
            <p className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {adminRoleLabels[admin.role]}
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8">
            <AdminLogoutButton />
          </div>
        </aside>

        <div className="space-y-6 py-1">{children}</div>
      </div>
    </div>
  );
}
