import type { AdminRole } from "@/server/auth/authorization";
import type {
  orderStatusEnum,
  productStatusEnum,
  quoteRequestSegmentEnum,
  quoteRequestStatusEnum
} from "@/server/db/schema";

export type ProductStatus = (typeof productStatusEnum.enumValues)[number];
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type QuoteStatus = (typeof quoteRequestStatusEnum.enumValues)[number];
export type QuoteSegment = (typeof quoteRequestSegmentEnum.enumValues)[number];

export const adminNavigation: Array<{
  href: string;
  label: string;
  roles: AdminRole[];
}> = [
  {
    href: "/admin",
    label: "Gösterge Paneli",
    roles: ["superadmin", "admin", "product_manager", "order_manager", "support_agent", "readonly"]
  },
  {
    href: "/admin/erisim",
    label: "Erişim",
    roles: ["superadmin", "admin", "product_manager", "order_manager", "support_agent", "readonly"]
  },
  {
    href: "/admin/site",
    label: "Site",
    roles: ["superadmin", "admin"]
  },
  {
    href: "/admin/urunler",
    label: "Ürünler",
    roles: ["superadmin", "admin", "product_manager", "readonly"]
  },
  {
    href: "/admin/siparisler",
    label: "Siparişler",
    roles: ["superadmin", "admin", "order_manager", "support_agent", "readonly"]
  },
  {
    href: "/admin/teklifler",
    label: "Teklifler",
    roles: ["superadmin", "admin", "order_manager", "support_agent", "readonly"]
  },
  {
    href: "/admin/saha",
    label: "Saha",
    roles: ["superadmin", "admin", "order_manager", "support_agent", "readonly"]
  },
  {
    href: "/admin/blog",
    label: "İçerik",
    roles: ["superadmin", "admin", "readonly"]
  },
  {
    href: "/admin/katalog",
    label: "Katalog",
    roles: ["superadmin", "admin", "product_manager", "readonly"]
  },
  {
    href: "/admin/envanter",
    label: "Envanter",
    roles: ["superadmin", "admin", "product_manager", "order_manager", "readonly"]
  },
  {
    href: "/admin/kampanyalar",
    label: "Kampanyalar",
    roles: ["superadmin", "admin", "product_manager", "readonly"]
  },
  {
    href: "/admin/bildirimler",
    label: "Bildirimler",
    roles: ["superadmin", "admin", "product_manager", "order_manager", "support_agent", "readonly"]
  },
  {
    href: "/admin/paytr",
    label: "PayTR",
    roles: ["superadmin", "admin", "order_manager", "readonly"]
  },
  {
    href: "/admin/audit",
    label: "Denetim",
    roles: ["superadmin"]
  },
  {
    href: "/admin/adminler",
    label: "Yöneticiler",
    roles: ["superadmin"]
  }
];

export const adminRoleLabels: Record<AdminRole, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  product_manager: "Ürün Yöneticisi",
  order_manager: "Sipariş Yöneticisi",
  support_agent: "Destek Yetkilisi",
  readonly: "Sadece Görüntüleme"
};

export const productCategoryOptions = [
  { slug: "ev-tipi", label: "Ev Tipi" },
  { slug: "is-yeri-tipi", label: "İş Yeri Tipi" },
  { slug: "dc-hizli-sarj", label: "DC Hızlı Şarj" },
  { slug: "aksesuar", label: "Aksesuar" }
] as const;

export const productTagOptions = [
  { value: "best_seller", label: "Çok Satan" },
  { value: "new", label: "Yeni" },
  { value: "corporate", label: "Kurumsal" },
  { value: "discounted", label: "İndirimli" }
] as const;

export const vehicleBrandOptions = [
  "TOGG",
  "Tesla",
  "BYD",
  "Renault",
  "Hyundai",
  "BMW",
  "Diğer"
] as const;

export const productStatusOptions: Array<{
  value: ProductStatus;
  label: string;
}> = [
  { value: "draft", label: "Taslak" },
  { value: "active", label: "Aktif" },
  { value: "archived", label: "Pasif" }
];

export const orderStatusOptions: Array<{
  value: OrderStatus;
  label: string;
}> = [
  { value: "pending_payment", label: "Beklemede" },
  { value: "pending_confirmation", label: "Ödeme Alındı" },
  { value: "confirmed", label: "Onaylandı" },
  { value: "payment_failed", label: "Ödeme Başarısız" },
  { value: "shipped", label: "Kargoya Verildi" },
  { value: "delivered", label: "Teslim Edildi" },
  { value: "cancelled", label: "İptal" },
  { value: "refunded", label: "İade" },
  { value: "failed", label: "Başarısız" },
  { value: "paid", label: "Ödendi (Eski)" },
  { value: "fulfilled", label: "Tamamlandı" },
  { value: "payment_processing", label: "Ödeme İşleniyor" },
  { value: "draft", label: "Taslak" }
];

export const quoteStatusOptions: Array<{
  value: QuoteStatus;
  label: string;
}> = [
  { value: "new", label: "Yeni Talep" },
  { value: "reviewing", label: "İnceleniyor" },
  { value: "proposal_sent", label: "Teklif Gönderildi" },
  { value: "negotiation", label: "Müzakere" },
  { value: "won", label: "Kazandı" },
  { value: "lost", label: "Kaybetti" }
];

export const quoteSegmentOptions: Array<{
  value: QuoteSegment;
  label: string;
}> = [
  { value: "site_apartment", label: "Site / Apartman" },
  { value: "business", label: "İş Yeri" },
  { value: "fleet", label: "Filo" },
  { value: "individual", label: "Bireysel" }
];

export const leadStatusOptions = [
  { value: "new", label: "Yeni" },
  { value: "contacted", label: "İletişime Geçildi" },
  { value: "qualified", label: "Nitelikli" },
  { value: "won", label: "Kazanıldı" },
  { value: "lost", label: "Kaybedildi" }
] as const;

export function formatOrderStatusLabel(status: OrderStatus) {
  return orderStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function formatQuoteStatusLabel(status: QuoteStatus) {
  return quoteStatusOptions.find((option) => option.value === status)?.label ?? status;
}
