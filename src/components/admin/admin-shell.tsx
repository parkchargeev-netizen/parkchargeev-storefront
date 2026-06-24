import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  CreditCard,
  Database,
  FileText,
  Globe2,
  LayoutDashboard,
  ListTree,
  Map as MapIcon,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  UserCog,
  Wrench
} from "lucide-react";

import {
  AdminCommandMenu,
  type AdminCommandItem
} from "@/components/admin/admin-command-menu";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminNavLink } from "@/components/admin/admin-nav-link";
import { AdminPrefetchLink } from "@/components/admin/admin-prefetch-link";
import { AdminSessionGuard } from "@/components/admin/admin-session-guard";
import { serviceCoverageSummary } from "@/lib/service-coverage";
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
  "/admin/erisim": MapIcon,
  "/admin/site": Globe2,
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
  "/admin": "Günlük satış, saha ve güvenlik özeti",
  "/admin/erisim": "Rol bazlı modüller ve yetki haritası",
  "/admin/site": "Menü, sayfa ve yayın akışı",
  "/admin/urunler": "Ürün, stok, fiyat ve SEO yönetimi",
  "/admin/siparisler": "Ödeme, kargo ve sipariş karşılama",
  "/admin/teklifler": "Ev, site, işletme ve ticari teklif akışı",
  "/admin/saha": "Keşif, servis ve kurulum planlama",
  "/admin/blog": "Blog, rehber ve içerik operasyonu",
  "/admin/katalog": "Kategori ve marka sözlükleri",
  "/admin/paytr": "Ödeme hareketleri ve callback kayıtları",
  "/admin/audit": "İşlem kayıtları ve güvenlik izleme",
  "/admin/adminler": "Admin kullanıcı ve oturum yönetimi"
};

const moduleGroups = [
  {
    label: "Operasyon",
    items: ["/admin", "/admin/siparisler", "/admin/teklifler", "/admin/saha"],
    icon: BarChart3
  },
  {
    label: "Ticaret",
    items: ["/admin/urunler", "/admin/katalog", "/admin/paytr"],
    icon: Boxes
  },
  {
    label: "İçerik ve site",
    items: ["/admin/site", "/admin/blog"],
    icon: Globe2
  },
  {
    label: "Güvenlik",
    items: ["/admin/erisim", "/admin/audit", "/admin/adminler"],
    icon: ShieldCheck
  }
] as const;

const commandActionItems: Array<AdminCommandItem & { roles: AdminRole[]; requiresDatabase?: boolean }> = [
  {
    href: "/admin/urunler/yeni",
    label: "Yeni ürün ekle",
    detail: "Fiyat, stok, varyant, SEO ve görselleri tek akışta gir",
    group: "Hızlı işlem",
    roles: ["superadmin", "sales"],
    requiresDatabase: true
  },
  {
    href: "/admin/blog/yeni",
    label: "Yeni rehber yazısı",
    detail: "SEO, AIEO ve müşteri sorularına cevap veren içerik oluştur",
    group: "Hızlı işlem",
    roles: ["superadmin", "editor"],
    requiresDatabase: true
  },
  {
    href: "/admin/teklifler",
    label: "Teklif masasını aç",
    detail: "Ev, site, KOBİ ve ticari lokasyon taleplerini önceliklendir",
    group: "Satış",
    roles: ["superadmin", "sales"],
    requiresDatabase: true
  },
  {
    href: "/admin/saha",
    label: "Saha planını kontrol et",
    detail: "Türkiye genelinden gelen keşif ve kurulum taleplerini yönet",
    group: "Operasyon",
    roles: ["superadmin", "operations", "technician"],
    requiresDatabase: true
  },
  {
    href: "/admin/adminler",
    label: "Admin oturumlarını denetle",
    detail: "Rol, aktif oturum ve güvenlik kayıtlarını incele",
    group: "Güvenlik",
    roles: ["superadmin"],
    requiresDatabase: true
  }
];

function getAdminInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "PC";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AdminShell({ admin, databaseEnabled = true, children }: AdminShellProps) {
  const items = adminNavigation
    .filter((item) => item.roles.includes(admin.role))
    .filter((item) => databaseEnabled || item.href === "/admin");
  const itemByHref = new Map(items.map((item) => [item.href, item]));
  const commandItems: AdminCommandItem[] = [
    ...items.map((item) => ({
      href: item.href,
      label: item.label,
      detail: navigationDetailMap[item.href] ?? "Admin modülü",
      group: "Modüller"
    })),
    ...commandActionItems
      .filter((item) => item.roles.includes(admin.role))
      .filter((item) => databaseEnabled || !item.requiresDatabase)
      .map((item) => ({
        href: item.href,
        label: item.label,
        detail: item.detail,
        group: item.group
      }))
  ];
  const mobileQuickItems = items.slice(0, 8);

  return (
    <div
      className="admin-experience min-h-screen bg-[#f4f8f6] text-slate-950"
      data-motion-scope
    >
      <AdminSessionGuard />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-emerald-200/28 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,51,38,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,143,111,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative mx-auto max-w-[1680px] px-4 py-5 lg:px-6">
        <div className="grid gap-6 xl:grid-cols-[316px_minmax(0,1fr)]">
          <aside className="hidden xl:block">
            <div className="sticky top-5 space-y-4">
              <section className="surface-card overflow-hidden border border-white/70 p-5">
                <div className="rounded-lg bg-[#063326] p-5 text-white">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-lg bg-white/[0.16] text-sm font-bold">
                      {getAdminInitials(admin.fullName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{admin.fullName}</p>
                      <p className="truncate text-xs text-white/76">{admin.email}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#063326]">
                      {adminRoleLabels[admin.role]}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-3 py-1 text-xs font-semibold text-white">
                      <Database className="h-3.5 w-3.5" />
                      {databaseEnabled ? "Canlı veri" : "Yerel veri"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  {[
                    serviceCoverageSummary.shipping,
                    serviceCoverageSummary.freeSurvey,
                    serviceCoverageSummary.installation
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-4 py-2 text-xs font-bold text-[#063326]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              <section className="surface-card border border-white/70 p-4">
                <div className="flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-normal text-slate-500">
                  <Sparkles className="h-4 w-4" />
                  Çalışma Alanı
                </div>
                <nav className="mt-4 space-y-5" aria-label="Admin modülleri">
                  {moduleGroups.map((group) => {
                    const visibleGroupItems = group.items.flatMap((href) => {
                      const item = itemByHref.get(href);
                      return item ? [item] : [];
                    });

                    if (visibleGroupItems.length === 0) {
                      return null;
                    }

                    const GroupIcon = group.icon;

                    return (
                      <div key={group.label}>
                        <p className="mb-2 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-normal text-slate-400">
                          <GroupIcon className="h-3.5 w-3.5" />
                          {group.label}
                        </p>
                        <div className="space-y-1.5">
                          {visibleGroupItems.map((item) => {
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
                        </div>
                      </div>
                    );
                  })}
                </nav>
              </section>

              <section className="surface-card border border-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
                  Hızlı panel
                </p>
                <div className="mt-3 grid gap-2">
                  <AdminPrefetchLink
                    href="/admin/teklifler"
                    className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-[#063326] transition hover:bg-emerald-100"
                  >
                    Teklifleri önceliklendir
                  </AdminPrefetchLink>
                  <AdminPrefetchLink
                    href="/admin/saha"
                    className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-200"
                  >
                    Saha planını aç
                  </AdminPrefetchLink>
                  <AdminLogoutButton />
                </div>
              </section>
            </div>
          </aside>

          <main className="min-w-0 space-y-5" data-motion-scope>
            <section className="surface-card border border-white/70 p-4 xl:hidden">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-normal text-[#063326]">
                    ParkChargeEV Admin
                  </p>
                  <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
                    Kontrol merkezi
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">{admin.fullName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#063326]">
                    {adminRoleLabels[admin.role]}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {databaseEnabled ? "Canlı veri" : "Yerel veri"}
                  </span>
                </div>
              </div>
              <nav className="mt-4 grid gap-2 sm:grid-cols-2" aria-label="Admin mobil modülleri">
                {mobileQuickItems.map((item) => {
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
              <div className="mt-4">
                <AdminLogoutButton />
              </div>
            </section>

            <section className="surface-card border border-white/70 px-5 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-normal text-[#0f8f6f]">
                    <Search className="h-4 w-4" />
                    Admin operasyonu
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
                    Satış, saha, içerik ve güvenlik tek ekranda.
                  </h2>
                </div>
                <AdminCommandMenu
                  items={commandItems}
                  roleLabel={adminRoleLabels[admin.role]}
                  databaseEnabled={databaseEnabled}
                />
              </div>
            </section>

            <div className="space-y-6 py-1">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
