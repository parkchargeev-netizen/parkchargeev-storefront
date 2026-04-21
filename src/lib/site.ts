export const siteConfig = {
  name: "ParkChargeEV",
  description:
    "Elektrikli araç şarj istasyonu ürünleri, kurulum hizmetleri ve teknik destek süreçlerini tek platformda buluşturan premium EV commerce deneyimi.",
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
  serviceAreas: ["Sakarya", "İstanbul", "Kocaeli", "Bursa", "Türkiye Geneli"],
  primaryNavigation: [
    { href: "/", label: "Ana Sayfa" },
    { href: "/magaza", label: "Mağaza" },
    { href: "/kurumsal-cozumler", label: "Kurumsal Çözümler" },
    { href: "/hizmetler", label: "Hizmetler" },
    { href: "/harita", label: "Harita" },
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
    { href: "/magaza", label: "Mağaza" },
    { href: "/blog", label: "Blog" },
    { href: "/harita", label: "Harita" },
    { href: "/iletisim", label: "İletişim" }
  ],
  legalNavigation: [
    { href: "/iletisim", label: "Destek Merkezi" },
    { href: "/giris", label: "Müşteri Girişi" },
    { href: "/odeme", label: "Ödeme" },
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
