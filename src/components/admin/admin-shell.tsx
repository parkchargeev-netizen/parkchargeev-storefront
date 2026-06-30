import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Boxes,
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
  UserCog
} from "lucide-react";

import {
  AdminCommandMenu,
  type AdminCommandItem
} from "@/components/admin/admin-command-menu";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminNavLink } from "@/components/admin/admin-nav-link";
import { AdminPrefetchLink } from "@/components/admin/admin-prefetch-link";
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
  "/admin/erisim": MapIcon,
  "/admin/site": Globe2,
  "/admin/urunler": Package,
  "/admin/siparisler": ShoppingCart,
  "/admin/teklifler": FileText,
  "/admin/saha": Activity,
  "/admin/blog": BookOpen,
  "/admin/katalog": ListTree,
  "/admin/envanter": Boxes,
  "/admin/kampanyalar": Sparkles,
  "/admin/bildirimler": Activity,
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
  "/admin/envanter": "Stok hareketleri ve kritik stok uyarıları",
  "/admin/kampanyalar": "Banner, kampanya ve vitrin yönetimi",
  "/admin/bildirimler": "Okunmamış operasyon bildirimleri",
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
    items: ["/admin/urunler", "/admin/katalog", "/admin/envanter", "/admin/kampanyalar", "/admin/paytr"],
    icon: Boxes
  },
  {
    label: "İçerik ve site",
    items: ["/admin/site", "/admin/blog"],
    icon: Globe2
  },
  {
    label: "Güvenlik",
    items: ["/admin/erisim", "/admin/bildirimler", "/admin/audit", "/admin/adminler"],
    icon: ShieldCheck
  }
] as const;

const commandActionItems: Array<AdminCommandItem & { roles: AdminRole[]; requiresDatabase?: boolean }> = [
  {
    href: "/admin/urunler/yeni",
    label: "Yeni ürün ekle",
    detail: "Fiyat, stok, varyant, SEO ve görselleri tek akışta gir",
    group: "Hızlı işlem",
    roles: ["superadmin", "admin", "product_manager"],
    requiresDatabase: true
  },
  {
    href: "/admin/blog/yeni",
    label: "Yeni rehber yazısı",
    detail: "SEO, AIEO ve müşteri sorularına cevap veren içerik oluştur",
    group: "Hızlı işlem",
    roles: ["superadmin", "admin"],
    requiresDatabase: true
  },
  {
    href: "/admin/teklifler",
    label: "Teklif masasını aç",
    detail: "Ev, site, KOBİ ve ticari lokasyon taleplerini önceliklendir",
    group: "Satış",
    roles: ["superadmin", "admin", "order_manager"],
    requiresDatabase: true
  },
  {
    href: "/admin/saha",
    label: "Saha planını kontrol et",
    detail: "Türkiye genelinden gelen keşif ve kurulum taleplerini yönet",
    group: "Operasyon",
    roles: ["superadmin", "admin", "order_manager", "support_agent"],
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
    <div className="admin-experience admin-control-center min-h-screen text-slate-950" data-motion-scope>
      <AdminSessionGuard />
      <div className="admin-control-backdrop" aria-hidden />

      <div className="admin-control-layout">
        <aside className="admin-control-sidebar">
          <div className="admin-control-brand">
            <span>PC</span>
            <div>
              <strong>ParkChargeEV</strong>
              <small>Commerce OS</small>
            </div>
          </div>

          <div className="admin-control-operator">
            <span>{getAdminInitials(admin.fullName)}</span>
            <div>
              <strong>{admin.fullName}</strong>
              <small>{admin.email}</small>
            </div>
          </div>

          <div className="admin-control-status">
            <span>{adminRoleLabels[admin.role]}</span>
            <span>
              <Database className="h-3.5 w-3.5" aria-hidden />
              {databaseEnabled ? "Canlı veri" : "Yerel veri"}
            </span>
          </div>

          <nav className="admin-control-nav" aria-label="Admin modülleri">
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
                <section key={group.label} className="admin-control-nav-group">
                  <p>
                    <GroupIcon className="h-3.5 w-3.5" aria-hidden />
                    {group.label}
                  </p>
                  <div>
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
                </section>
              );
            })}
          </nav>

          <div className="admin-control-quick">
            <p>
              <Sparkles className="h-4 w-4" aria-hidden />
              Hızlı işlemler
            </p>
            <AdminPrefetchLink href="/admin/urunler/yeni">Yeni ürün oluştur</AdminPrefetchLink>
            <AdminPrefetchLink href="/admin/kampanyalar">Kampanya ve vitrin</AdminPrefetchLink>
            <AdminPrefetchLink href="/admin/site">Site ayarlarını yönet</AdminPrefetchLink>
            <AdminLogoutButton />
          </div>
        </aside>

        <main className="admin-control-workspace" data-motion-scope>
          <header className="admin-control-topbar">
            <div>
              <p>
                <Search className="h-4 w-4" aria-hidden />
                Operasyon merkezi
              </p>
              <h1>Ürün, sipariş, stok ve site yönetimi tek panelde.</h1>
            </div>
            <AdminCommandMenu
              items={commandItems}
              roleLabel={adminRoleLabels[admin.role]}
              databaseEnabled={databaseEnabled}
            />
          </header>

          <section className="admin-control-mobile-nav" aria-label="Admin mobil modülleri">
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
          </section>

          <div className="admin-control-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
