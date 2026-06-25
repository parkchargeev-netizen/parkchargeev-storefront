export const siteConfig = {
  name: "ParkChargeEV",
  description:
    "Elektrikli araç şarj cihazları, ev tipi wallbox ürünleri, Type 2 aksesuarlar, keşif, kurulum ve teknik destek çözümleri.",
  domain: "parkchargeev.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://parkchargeev.com",
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "05514914320",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "info@parkchargeev.com",
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "905514914320",
  officeCity: process.env.NEXT_PUBLIC_OFFICE_CITY ?? "Sakarya",
  address: {
    streetAddress:
      "Esentepe Mah. Akademiyolu Sokak Sakarya Üniversitesi Teknokent B Blok 10B/Z05",
    addressLocality: "Serdivan",
    addressRegion: "Sakarya",
    postalCode: "",
    addressCountry: "TR"
  },
  socials: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? ""
  },
  supportHours: "Mo-Sa 09:00-18:00",
  serviceAreas: ["Türkiye geneli"],
  primaryNavigation: [
    { href: "/", label: "Anasayfa" },
    { href: "/magaza", label: "Mağaza" },
    { href: "/urun-secici", label: "Ürün Seçici" },
    { href: "/karsilastir", label: "Karşılaştır" },
    { href: "/kurumsal-cozumler", label: "Kurumsal Çözümler" },
    { href: "/hizmetler", label: "Hizmetler" },
    { href: "/blog", label: "Blog" },
    { href: "/iletisim", label: "İletişim" }
  ],
  secondaryNavigation: [
    { href: "/giris", label: "Giriş Yap" },
    { href: "/hesabim", label: "Hesabım" },
    { href: "/sepet", label: "Sepetim" }
  ],
  footerNavigation: [
    { href: "/hakkimizda", label: "Hakkımızda" },
    { href: "/kurumsal-cozumler", label: "Kurumsal Çözümler" },
    { href: "/elektrikli-arac-sarj-rehberi", label: "EV Şarj Rehberi" },
    { href: "/urun-secici", label: "Ürün Seçici" },
    { href: "/karsilastir", label: "Karşılaştır" },
    { href: "/magaza", label: "Mağaza" },
    { href: "/blog", label: "Blog" },
    { href: "/iletisim", label: "İletişim" }
  ],
  legalNavigation: [
    { href: "/iletisim", label: "Destek Merkezi" },
    { href: "/giris", label: "Müşteri Girişi" },
    { href: "/checkout", label: "Ödeme" },
    { href: "/sepet", label: "Sepet" }
  ]
} as const;

export function absoluteUrl(path = "/") {
  const baseUrl = siteConfig.url.endsWith("/")
    ? siteConfig.url.slice(0, -1)
    : siteConfig.url;

  if (!path.startsWith("/")) {
    return `${baseUrl}/${path}`;
  }

  return `${baseUrl}${path}`;
}
