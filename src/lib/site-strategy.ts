export const primarySiteMessages = [
  {
    label: "Karar mesajı",
    message: "Aracınız ve altyapınız için doğru şarj çözümünü seçin.",
    detail: "Kullanıcı önce cihazı değil; araç, otopark, güç ve kurulum uygunluğunu net görür."
  },
  {
    label: "Güven mesajı",
    message: "Şarj cihazını değil, güvenli kurulumla birlikte doğru çözümü alın.",
    detail: "Keşif, pano/faz kontrolü, ürün uyumu ve ödeme güveni aynı yolculukta anlatılır."
  },
  {
    label: "Platform mesajı",
    message: "Ev, site ve işletmeler için şarj kararını tek yerde netleştirin.",
    detail: "Bireysel alıcı hızlı mağazaya, kurumsal karar verici teklif veya keşif akışına gider."
  }
] as const;

export const personaCtaMatrix = [
  {
    persona: "Ev kullanıcısı",
    cta: "Evime Uygun Cihazı Bul",
    href: "/urun-secici",
    intent: "7.4 / 11 kW wallbox ve güvenli kurulum"
  },
  {
    persona: "Aksesuar alıcısı",
    cta: "Hemen Satın Al",
    href: "/magaza?category=Aksesuar",
    intent: "Type 2 kablo, adaptör ve 81 il ürün kargosu"
  },
  {
    persona: "Site yöneticisi",
    cta: "Site İçin Keşif Planla",
    href: "/iletisim?reason=Site%20i%C3%A7in%20ke%C5%9Fif",
    intent: "Ortak otopark, RFID, yük yönetimi ve yönetim sunumu"
  },
  {
    persona: "İşletme",
    cta: "Kurumsal Teklif Al",
    href: "/iletisim?reason=Kurumsal%20teklif",
    intent: "22 kW AC, ofis otoparkı, servis ve raporlama"
  },
  {
    persona: "Filo",
    cta: "Filo Çözümü Planla",
    href: "/iletisim?reason=Filo%20%C3%A7%C3%B6z%C3%BCm%C3%BC",
    intent: "Çok araçlı kullanım, vardiya şarjı ve operasyon takibi"
  },
  {
    persona: "Ticari lokasyon",
    cta: "ROI Ön Fizibilite Al",
    href: "/iletisim?reason=ROI%20%C3%B6n%20fizibilite",
    intent: "DC hızlı şarj, lokasyon geliri ve saha uygunluğu"
  },
  {
    persona: "Elektrikçi",
    cta: "Partner Başvurusu Yap",
    href: "/iletisim?reason=Partner%20ba%C5%9Fvurusu",
    intent: "Teknik doküman, ürün tedariki ve kurulum standardı"
  }
] as const;

export const trustMessages = [
  "PayTR güvenli ödeme altyapısı.",
  "Ürün kargosu Türkiye'nin 81 iline.",
  "Kurulum ve keşif süreci planlı ilerler.",
  "Araç, soket ve güç uyumu birlikte kontrol edilir.",
  "Sipariş ve ödeme durumu panelden takip edilir."
] as const;

export const seoIntentClusters = [
  {
    cluster: "Ev tipi şarj",
    query: "Ev tipi araç şarj cihazı, wallbox, 11 kW, 7.4 kW",
    href: "/magaza?category=Ev%20Tipi"
  },
  {
    cluster: "Araç marka uyumu",
    query: "Togg şarj cihazı, Tesla wallbox, BYD Type 2",
    href: "/urun-secici"
  },
  {
    cluster: "Site / apartman",
    query: "Apartmanda şarj cihazı kurulumu, site otopark şarj",
    href: "/kurumsal-cozumler/site-ve-apartman"
  },
  {
    cluster: "İşletme",
    query: "Ofis otopark şarj istasyonu, 22 kW AC",
    href: "/iletisim?reason=Kurumsal%20teklif"
  },
  {
    cluster: "Aksesuar",
    query: "Type 2 kablo, şarj kablosu 5m, adaptör",
    href: "/magaza?category=Aksesuar"
  },
  {
    cluster: "Yatırım",
    query: "DC hızlı şarj istasyonu maliyeti, şarj istasyonu yatırım",
    href: "/iletisim?reason=ROI%20%C3%B6n%20fizibilite"
  }
] as const;

export const funnelAuditPhases = [
  "Türkçe karakter, ölçüm eventleri, Core Web Vitals ve PayTR hata dili",
  "Renk, tipografi, card, chip, form, drawer, accordion ve mobil compact kurallar",
  "Hero, persona rotaları, kompakt mağaza seridi, güven ve sosyal kanıt",
  "Mağaza arama, kategori çipleri, filtre drawer ve ürün rayı",
  "Ürün seçici 4 soru, sonuç kartı, keşif ve ürün CTA",
  "Ürün detay sticky buybox, mobil sticky buy bar, accordion ve medya alanı",
  "PayTR uyumlu sepet/ödeme, Türkçe hata mesajları, sipariş sonucu",
  "Admin ve müşteri panelinde sipariş, ödeme, keşif, kurulum ve içerik rehberliği",
  "Lighthouse, mobil kullanılabilirlik, test siparişi ve SEO schema kontrolü"
] as const;
