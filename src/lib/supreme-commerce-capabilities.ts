export type CommerceCapabilityTone = "emerald" | "blue" | "amber" | "violet";

export type CommerceCapability = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  proof: string;
  tone: CommerceCapabilityTone;
  bullets: string[];
};

export type CommerceSignal = {
  label: string;
  value: string;
  detail: string;
};

export const commerceSignals = [
  {
    label: "Performans",
    value: "Lazy",
    detail: "Kart, galeri ve vitrin gorselleri yalnizca ihtiyac aninda yuklenir."
  },
  {
    label: "Kesif",
    value: "SEO+AI",
    detail: "Urun, kategori, breadcrumb ve FAQ yapilari arama/AI motorlari icin okunabilir."
  },
  {
    label: "Operasyon",
    value: "Panel",
    detail: "Vitrin, urun, etiket, stok ve icerik alanlari admin tarafindan yonetilir."
  }
] as const satisfies ReadonlyArray<CommerceSignal>;

export const commerceCapabilities = [
  {
    id: "conversion-engine",
    eyebrow: "Satis ve donusum",
    title: "Filtre, karsilastirma ve hizli karar akisi",
    description:
      "Magaza deneyimi urun secici, kategori/guc/kurulum filtreleri ve karsilastirma sayfasi ile musterinin kararini kisaltir.",
    proof: "Gelismis filtreleme + urun karsilastirma",
    tone: "emerald",
    bullets: ["Guc ve kurulum bazli filtre", "Karsilastirma sepeti", "Ikinci gorsel hover deneyimi"]
  },
  {
    id: "design-system",
    eyebrow: "Tasarim ve blok mimarisi",
    title: "Tek tasarim diliyle premium ticaret vitrinleri",
    description:
      "Urun kartlari, vitrin raylari ve ana sayfa bloklari ayni kart, rozet, bosluk ve hareket sistemini kullanir.",
    proof: "Blok yonetimi mantigina uyarlanmis UI",
    tone: "blue",
    bullets: ["Cam yuzey ve yumusak derinlik", "Responsive kart olculeri", "GPU dostu mikro etkilesim"]
  },
  {
    id: "seo-discovery",
    eyebrow: "SEO ve AI gorunurlugu",
    title: "Structured data, sitemap ve urun niyeti ayni hizada",
    description:
      "Urun listeleme, detay, FAQ, breadcrumb ve image sitemap yapilari arama motorlari ve LLM tarayicilari icin acik sinyaller uretir.",
    proof: "Rich snippet odakli teknik SEO",
    tone: "violet",
    bullets: ["Product ve ItemList schema", "Canonical ve llms.txt", "Image sitemap ve robots uyumu"]
  },
  {
    id: "logistics-payment",
    eyebrow: "Odeme ve lojistik",
    title: "PayTR, bolgesel teslimat ve WhatsApp temas hazirligi",
    description:
      "Tek sayfa sepet/odeme akisi, kargo etiketleri ve WhatsApp temas katmani EV sarj urunlerinde guven hissini artirir.",
    proof: "PayTR + kargo + sosyal satis sinyali",
    tone: "amber",
    bullets: ["PayTR iframe odeme akisi", "Urun bazli kargo rozeti", "WhatsApp ile teklif ve destek"]
  }
] as const satisfies ReadonlyArray<CommerceCapability>;
