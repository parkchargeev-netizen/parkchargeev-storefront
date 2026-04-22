import type { AdminRole } from "@/server/auth/authorization";
import type {
  productStatusEnum,
  quoteRequestSegmentEnum,
  quoteRequestStatusEnum,
  orderStatusEnum
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
    label: "Dashboard",
    roles: ["superadmin", "sales", "operations", "technician", "editor"]
  },
  {
    href: "/admin/urunler",
    label: "Urunler",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/siparisler",
    label: "Siparisler",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/teklifler",
    label: "Teklifler",
    roles: ["superadmin", "sales"]
  }
];

export const adminRoleLabels: Record<AdminRole, string> = {
  superadmin: "Superadmin",
  sales: "Satis",
  operations: "Operasyon",
  technician: "Saha Teknisyeni",
  editor: "Icerik Editoru"
};

export const productCategoryOptions = [
  { slug: "ev-tipi", label: "Ev Tipi" },
  { slug: "is-yeri-tipi", label: "Is Yeri Tipi" },
  { slug: "dc-hizli-sarj", label: "DC Hizli Sarj" },
  { slug: "aksesuar", label: "Aksesuar" }
] as const;

export const productTagOptions = [
  { value: "best_seller", label: "Cok Satan" },
  { value: "new", label: "Yeni" },
  { value: "corporate", label: "Kurumsal" },
  { value: "discounted", label: "Indirimli" }
] as const;

export const vehicleBrandOptions = [
  "TOGG",
  "Tesla",
  "BYD",
  "Renault",
  "Hyundai",
  "BMW",
  "Diger"
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
  { value: "pending_confirmation", label: "Odeme Alindi" },
  { value: "confirmed", label: "Onaylandi" },
  { value: "shipped", label: "Kargoya Verildi" },
  { value: "delivered", label: "Teslim Edildi" },
  { value: "cancelled", label: "Iptal" },
  { value: "refunded", label: "Iade" },
  { value: "failed", label: "Basarisiz" },
  { value: "paid", label: "Odendi (Eski)" },
  { value: "fulfilled", label: "Tamamlandi" },
  { value: "payment_processing", label: "Odeme Isleniyor" },
  { value: "draft", label: "Taslak" }
];

export const quoteStatusOptions: Array<{
  value: QuoteStatus;
  label: string;
}> = [
  { value: "new", label: "Yeni Talep" },
  { value: "reviewing", label: "Inceleniyor" },
  { value: "proposal_sent", label: "Teklif Gonderildi" },
  { value: "negotiation", label: "Muzakere" },
  { value: "won", label: "Kazandi" },
  { value: "lost", label: "Kaybetti" }
];

export const quoteSegmentOptions: Array<{
  value: QuoteSegment;
  label: string;
}> = [
  { value: "site_apartment", label: "Site / Apartman" },
  { value: "business", label: "Is Yeri" },
  { value: "fleet", label: "Filo" },
  { value: "individual", label: "Bireysel" }
];

export function formatOrderStatusLabel(status: OrderStatus) {
  return orderStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function formatQuoteStatusLabel(status: QuoteStatus) {
  return quoteStatusOptions.find((option) => option.value === status)?.label ?? status;
}
