export const publicMerchandisingSlotKeys = {
  homeProductPortfolio: "home_product_portfolio",
  storeFeaturedProducts: "store_featured_products"
} as const;

export type PublicMerchandisingSlotKey =
  (typeof publicMerchandisingSlotKeys)[keyof typeof publicMerchandisingSlotKeys];

export const publicProductMerchandisingSections = [
  {
    slotKey: publicMerchandisingSlotKeys.homeProductPortfolio,
    title: "Anasayfa ürün portföyü",
    description: "Anasayfadaki Ürün portföyü bölümünde gösterilecek ürünleri ve sıralamayı yönetir.",
    maxItems: 12
  },
  {
    slotKey: publicMerchandisingSlotKeys.storeFeaturedProducts,
    title: "Mağaza öne çıkan ürünler",
    description: "Mağaza sayfasındaki Öne çıkanlar / Popüler şarj ürünleri alanını yönetir.",
    maxItems: 24
  }
] as const;

