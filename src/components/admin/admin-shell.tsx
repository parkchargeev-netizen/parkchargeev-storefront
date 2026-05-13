import type { ReactNode } from "react";
import {
  Activity,
  BookOpen,
  CreditCard,
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  ListTree,
  Map,
  Package,
  ShieldCheck,
  ShoppingCart,
  UserCog
} from "lucide-react";

import {
  AdminCommandMenu,
  type AdminCommandItem
} from "@/components/admin/admin-command-menu";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminNavLink } from "@/components/admin/admin-nav-link";
import { AdminSessionGuard } from "@/components/admin/admin-session-guard";
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
  "/admin/erisim": Map,
  "/admin/site": Globe,
  "/admin/urunler": Package,
  "/admin/siparisler": ShoppingCart,
  "/admin/teklifler": FileText,
  "/admin/saha": Activity,
  "/admin/blog": BookOpen,
  "/admin/katalog": ListTree,
  "/admin/paytr": CreditCard,
  "/admin/audit": ShieldCheck,
  "/admin/adminler": UserCog
} as const;

const navigationDetailMap: Record<string, string> = {
  "/admin": "KPI, kuyruk ve operasyon ozeti",
  "/admin/erisim": "Tum yetkili admin modulleri",
  "/admin/site": "Menu, sayfa ve public icerik yonetimi",
  "/admin/urunler": "Katalog, stok, fiyat ve SEO",
  "/admin/siparisler": "Odeme, teslimat ve fulfillment",
  "/admin/teklifler": "B2B/B2C teklif pipeline",
  "/admin/saha": "Servis ve saha talepleri",
  "/admin/blog": "Blog ve icerik operasyonu",
  "/admin/katalog": "Marka ve kategori sozlukleri",
  "/admin/paytr": "Odeme hareketleri",
  "/admin/audit": "Islem kayitlari ve izleme",
  "/admin/adminler": "Rol ve admin kullanici yonetimi"
};

const commandActionItems: Array<AdminCommandItem & { roles: AdminRole[]; requiresDatabase?: boolean }> = [
  {
    href: "/admin/urunler/yeni",
    label: "Yeni urun olustur",
    detail: "Katalog, fiyat, stok ve SEO alanlarini doldur",
    group: "Hizli islem",
    roles: ["superadmin", "sales"],
    requiresDatabase: true
  },
  {
    href: "/admin/blog/yeni",
    label: "Yeni blog yazisi",
    detail: "Public icerik akisini guncelle",
    group: "Hizli islem",
    roles: ["superadmin", "editor"],
    requiresDatabase: true
  },
  {
    href: "/admin/site#new-navigation",
    label: "Menu linki ekle",
    detail: "Ust menu ve footer navigasyonunu yonet",
    group: "Hizli islem",
    roles: ["superadmin", "editor"],
    requiresDatabase: true
  },
  {
    href: "/admin/audit",
    label: "Audit log incele",
    detail: "Degisiklikleri, aktorleri ve islem gecmisini kontrol et",
    group: "Guvenlik",
    roles: ["superadmin"],
    requiresDatabase: true
  },
  {
    href: "/admin/adminler",
    label: "Admin ve oturumlari yonet",
    detail: "Roller, aktif oturumlar ve yetki seviyesi",
    group: "Guvenlik",
    roles: ["superadmin"],
    requiresDatabase: true
  }
];

export function AdminShell({ admin, databaseEnabled = true, children }: AdminShellProps) {
  const items = adminNavigation
    .filter((item) => item.roles.includes(admin.role))
    .filter((item) => databaseEnabled || item.href === "/admin");
  const commandItems: AdminCommandItem[] = [
    ...items.map((item) => ({
      href: item.href,
      label: item.label,
      detail: navigationDetailMap[item.href] ?? "Admin modulu",
      group: "Moduller"
    })),
    ...commandActionItems
      .filter((item) => item.roles.includes(admin.role))
      .filter((item) => databaseEnabled || !item.requiresDatabase)
      .map(({ roles: _roles, requiresDatabase: _requiresDatabase, ...item }) => item)
  ];

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <AdminSessionGuard />
      <div className="mx-auto max-w-[1680px] px-4 py-5 lg:px-6">
        <div className="grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="surface-card sticky top-5 h-fit overflow-hidden border border-slate-200 bg-white/95 p-6">
            <div className="rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,rgba(0,68,211,0.08),rgba(0,110,47,0.05))] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">
                ParkChargeEV Admin
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-slate-950">
                Operasyon Kontrol Merkezi
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Katalog, siparis, teklif ve saha islerini oncelik sirasiyla yonetin.
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
              <nav className="mt-3 space-y-2" aria-label="Admin modulleri">
                {items.map((item) => {
                  const Icon =
                    navigationIconMap[item.href as keyof typeof navigationIconMap] ??
                    LayoutDashboard;

                  return (
                    <AdminNavLink
                      key={item.href}
                      href={item.href}
                      icon={<Icon className="h-4 w-4" />}
                      label={item.label}
                    />
                  );
                })}
              </nav>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Panel Durumu
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Komut aramasi, rol bazli navigasyon, oturum uyarisi ve admin-only guvenlik
                basliklari aktif.
              </p>
            </div>

            <div className="mt-8">
              <AdminLogoutButton />
            </div>
          </aside>

          <div className="min-w-0 space-y-6">
            <section className="soft-panel overflow-hidden px-6 py-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Control Center
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Bugunun islem masasi
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Arama, hizli islem, guvenlik durumu ve rol kapsamli moduller tek ust katmanda
                    toplandi.
                  </p>
                </div>

                <AdminCommandMenu
                  items={commandItems}
                  roleLabel={adminRoleLabels[admin.role]}
                  databaseEnabled={databaseEnabled}
                />
              </div>
            </section>

            <div className="space-y-6 py-1">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
