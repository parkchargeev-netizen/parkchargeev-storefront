import type { AdminRole } from "@/server/auth/authorization";

export type AdminAccessLink = {
  href: string;
  label: string;
  description: string;
  group: "Operasyon" | "Katalog" | "İçerik" | "Yönetim" | "Dışarı Aktar";
  roles: AdminRole[];
};

export const adminAccessLinks: AdminAccessLink[] = [
  {
    href: "/admin",
    label: "Gösterge Paneli",
    description: "KPI, son sipariş, teklif ve saha talebi özeti.",
    group: "Operasyon",
    roles: ["superadmin", "sales", "operations", "technician", "editor"]
  },
  {
    href: "/admin/urunler",
    label: "Ürünler",
    description: "Ürün listesi, filtreleme, CSV dışa aktarma ve detay düzenleme.",
    group: "Katalog",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/site",
    label: "Site yönetimi",
    description: "Navbar, footer linkleri, SEO alanları ve yönetilebilir sayfalar.",
    group: "Yönetim",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/site?status=primary",
    label: "Üst menü yönetimi",
    description: "Header navbar linklerini tek ekranda sırala, aktif/pasif yap ve güncelle.",
    group: "Yönetim",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/site?status=published",
    label: "Yayındaki sayfalar",
    description: "Yayında görünen CMS sayfalarını, SEO ve sitemap kararlarını yönet.",
    group: "Yönetim",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/site?status=draft",
    label: "Taslak sayfalar",
    description: "Yeni sayfa hazırlıklarını ve yayın öncesi içerik detaylarını tamamla.",
    group: "Yönetim",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/urunler/yeni",
    label: "Yeni ürün",
    description: "Marka, kategori, medya ve çoklu varyantla ürün oluşturma.",
    group: "Katalog",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/katalog",
    label: "Marka ve kategori",
    description: "Ürün formunu besleyen katalog sözlükleri.",
    group: "Katalog",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/siparisler",
    label: "Siparişler",
    description: "Sipariş liste, detay, kargo ve durum yönetimi.",
    group: "Operasyon",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/teklifler",
    label: "Teklifler",
    description: "B2B talepler, atama, satış akışı ve durum güncelleme.",
    group: "Operasyon",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/saha",
    label: "Saha talepleri",
    description: "Keşif, servis ve kurulum taleplerinin atama/durum akışı.",
    group: "Operasyon",
    roles: ["superadmin", "operations", "technician"]
  },
  {
    href: "/admin/istasyonlar",
    label: "İstasyonlar",
    description: "İstasyon kayıtları, soket durumu ve konum bilgileri.",
    group: "Operasyon",
    roles: ["superadmin", "operations", "technician"]
  },
  {
    href: "/admin/blog",
    label: "İçerikler",
    description: "Blog yazısı listeleme, filtreleme ve düzenleme.",
    group: "İçerik",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/blog/yeni",
    label: "Yeni içerik",
    description: "Blog yazısı ve SEO alanlarını oluşturma.",
    group: "İçerik",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/paytr",
    label: "PayTR operasyonları",
    description: "İşlem inceleme, mutabakat ve iade işaretleme.",
    group: "Operasyon",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/adminler",
    label: "Admin kullanıcıları",
    description: "Kullanıcı ekleme, rol, durum, şifre ve oturum yönetimi.",
    group: "Yönetim",
    roles: ["superadmin"]
  },
  {
    href: "/admin/audit",
    label: "Denetim logu",
    description: "Admin mutasyon kayıtları ve veri detayları.",
    group: "Yönetim",
    roles: ["superadmin"]
  },
  {
    href: "/api/admin/products?format=csv&limit=50",
    label: "Ürün CSV",
    description: "Filtrelenmemiş son 50 ürün kaydını indirir.",
    group: "Dışarı Aktar",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/api/admin/orders?format=csv&limit=50",
    label: "Sipariş CSV",
    description: "Filtrelenmemiş son 50 sipariş kaydını indirir.",
    group: "Dışarı Aktar",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/api/admin/quotes?format=csv&limit=50",
    label: "Teklif CSV",
    description: "Filtrelenmemiş son 50 teklif kaydını indirir.",
    group: "Dışarı Aktar",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/api/admin/service-leads?format=csv&limit=50",
    label: "Saha CSV",
    description: "Filtrelenmemiş son 50 saha talebini indirir.",
    group: "Dışarı Aktar",
    roles: ["superadmin", "operations", "technician"]
  },
  {
    href: "/api/admin/audit?format=csv&limit=50",
    label: "Denetim CSV",
    description: "Filtrelenmemiş son 50 denetim kaydını indirir.",
    group: "Dışarı Aktar",
    roles: ["superadmin"]
  }
];

export function getAdminAccessLinks(role: AdminRole) {
  return adminAccessLinks.filter((link) => link.roles.includes(role));
}
