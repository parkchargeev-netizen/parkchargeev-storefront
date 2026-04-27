import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Database,
  FileText,
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingCart
} from "lucide-react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { adminNavigation, adminRoleLabels } from "@/server/admin/constants";
import type { AdminRole } from "@/server/auth/authorization";

type AdminShellProps = {
  admin: {
    fullName: string;
    email: string;
    role: AdminRole;
  };
  databaseEnabled?: boolean;
  children: ReactNode;
};

const navigationIconMap = {
  "/admin": LayoutDashboard,
  "/admin/urunler": Package,
  "/admin/siparisler": ShoppingCart,
  "/admin/teklifler": FileText
} as const;

export function AdminShell({ admin, databaseEnabled = true, children }: AdminShellProps) {
  const items = adminNavigation
    .filter((item) => item.roles.includes(admin.role))
    .filter((item) => databaseEnabled || item.href === "/admin");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,68,211,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(0,110,47,0.08),transparent_22%),#eef2ff]">
      <div className="mx-auto max-w-[1680px] px-4 py-5 lg:px-6">
        <div className="grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="surface-card sticky top-5 h-fit overflow-hidden border border-slate-200 bg-white/95 p-6">
            <div className="rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,rgba(0,68,211,0.09),rgba(0,110,47,0.04))] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
                ParkChargeEV Admin
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-slate-950">
                Operasyon Kontrol Merkezi
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Katalog, siparis ve teklif akisini tek panelden yonetin.
              </p>
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50/90 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{admin.fullName}</p>
                  <p className="mt-1 text-sm text-slate-600">{admin.email}</p>
                </div>
                <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {adminRoleLabels[admin.role]}
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    databaseEnabled
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <Database className="h-3.5 w-3.5" />
                  {databaseEnabled ? "Canli veri modu" : "Fallback veri modu"}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Calisma Alani
              </p>
              <nav className="mt-3 space-y-2">
                {items.map((item) => {
                  const Icon =
                    navigationIconMap[item.href as keyof typeof navigationIconMap] ??
                    LayoutDashboard;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
                    >
                      <span className="flex items-center gap-3">
                        <span className="rounded-2xl bg-slate-100 p-2 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-700">
                          <Icon className="h-4 w-4" />
                        </span>
                        {item.label}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Panel Durumu
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Yeni shell ve reusable data table foundation aktif. Bu alan, operasyon odakli yeni
                admin deneyiminin giris katmani olarak kullaniliyor.
              </p>
            </div>

            <div className="mt-8">
              <AdminLogoutButton />
            </div>
          </aside>

          <div className="space-y-6">
            <section className="soft-panel overflow-hidden px-6 py-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Control Center
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Queue-first admin foundation
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Liste gorunumleri reusable tablo omurgasina, shell ise operasyon merkezine
                    donusen yeni bilgi mimarisine gore yenileniyor.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-white/70 bg-white/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Role</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {adminRoleLabels[admin.role]}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white/70 bg-white/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Data</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {databaseEnabled ? "Canli baglanti" : "Yerel fallback"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-white/70 bg-white/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Modules</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {items.length} aktif gorunum
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-6 py-1">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
