import type { AdminRole } from "@/server/auth/authorization";

export type AdminAccessLink = {
  href: string;
  label: string;
  description: string;
  group: "Operasyon" | "Katalog" | "Icerik" | "Yonetim" | "Disari Aktar";
  roles: AdminRole[];
};

export const adminAccessLinks: AdminAccessLink[] = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "KPI, son siparis, teklif ve saha talebi ozeti.",
    group: "Operasyon",
    roles: ["superadmin", "sales", "operations", "technician", "editor"]
  },
  {
    href: "/admin/urunler",
    label: "Urunler",
    description: "Urun listesi, filtreleme, CSV export ve detay duzenleme.",
    group: "Katalog",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/site",
    label: "Site yonetimi",
    description: "Navbar, footer linkleri, SEO alanlari ve yonetilebilir sayfalar.",
    group: "Yonetim",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/site?status=primary",
    label: "Ust menu yonetimi",
    description: "Header navbar linklerini tek ekranda sirala, aktif/pasif yap ve guncelle.",
    group: "Yonetim",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/site?status=published",
    label: "Yayindaki sayfalar",
    description: "Public gorunen CMS sayfalarini, SEO ve sitemap kararlarini yonet.",
    group: "Yonetim",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/site?status=draft",
    label: "Taslak sayfalar",
    description: "Yeni sayfa hazirliklarini ve yayin oncesi icerik detaylarini tamamla.",
    group: "Yonetim",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/urunler/yeni",
    label: "Yeni urun",
    description: "Marka, kategori, medya ve coklu varyantla urun olusturma.",
    group: "Katalog",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/katalog",
    label: "Marka ve kategori",
    description: "Urun formunu besleyen katalog sozlukleri.",
    group: "Katalog",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/siparisler",
    label: "Siparisler",
    description: "Siparis liste, detay, kargo ve durum yonetimi.",
    group: "Operasyon",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/teklifler",
    label: "Teklifler",
    description: "B2B talepler, atama, pipeline ve durum guncelleme.",
    group: "Operasyon",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/saha",
    label: "Saha talepleri",
    description: "Kesif, servis ve kurulum taleplerinin atama/durum akisi.",
    group: "Operasyon",
    roles: ["superadmin", "operations", "technician"]
  },
  {
    href: "/admin/blog",
    label: "Icerikler",
    description: "Blog yazisi listeleme, filtreleme ve duzenleme.",
    group: "Icerik",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/blog/yeni",
    label: "Yeni icerik",
    description: "Blog yazisi ve SEO alanlarini olusturma.",
    group: "Icerik",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/paytr",
    label: "PayTR operasyonlari",
    description: "Transaction inceleme, mutabakat ve iade isaretleme.",
    group: "Operasyon",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/adminler",
    label: "Admin kullanicilar",
    description: "Kullanici ekleme, rol, durum, sifre ve oturum yonetimi.",
    group: "Yonetim",
    roles: ["superadmin"]
  },
  {
    href: "/admin/audit",
    label: "Audit log",
    description: "Admin mutasyon kayitlari ve payload detaylari.",
    group: "Yonetim",
    roles: ["superadmin"]
  },
  {
    href: "/api/admin/products?format=csv&limit=50",
    label: "Urun CSV",
    description: "Filtrelenmemis son 50 urun kaydini indirir.",
    group: "Disari Aktar",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/api/admin/orders?format=csv&limit=50",
    label: "Siparis CSV",
    description: "Filtrelenmemis son 50 siparis kaydini indirir.",
    group: "Disari Aktar",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/api/admin/quotes?format=csv&limit=50",
    label: "Teklif CSV",
    description: "Filtrelenmemis son 50 teklif kaydini indirir.",
    group: "Disari Aktar",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/api/admin/service-leads?format=csv&limit=50",
    label: "Saha CSV",
    description: "Filtrelenmemis son 50 saha talebini indirir.",
    group: "Disari Aktar",
    roles: ["superadmin", "operations", "technician"]
  },
  {
    href: "/api/admin/audit?format=csv&limit=50",
    label: "Audit CSV",
    description: "Filtrelenmemis son 50 audit kaydini indirir.",
    group: "Disari Aktar",
    roles: ["superadmin"]
  }
];

export function getAdminAccessLinks(role: AdminRole) {
  return adminAccessLinks.filter((link) => link.roles.includes(role));
}
