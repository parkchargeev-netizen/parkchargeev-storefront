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

export const decisionUniverses = [
  {
    label: "Evren A",
    title: "Hızlı satın alma",
    audience: "Aksesuar ve hazır ürün alıcısı",
    trigger: "Fiyat, stok, 81 il kargo ve hızlı sepet görünürse satın alma hızlanır.",
    design: "Kompakt ürün kartı, yatay ürün rayı, mobil sticky sepet ve kısa güven çipleri.",
    metric: "PDP tıklama + sepete ekleme",
    href: "/magaza",
    cta: "Mağazayı Aç"
  },
  {
    label: "Evren B",
    title: "Uygunluk rehberi",
    audience: "Yeni EV sahibi ve ev tipi wallbox alıcısı",
    trigger: "Pano, faz, soket ve güç belirsizliği azaltılırsa keşif veya sepete ekleme artar.",
    design: "4 soruluk seçici, önerilen güç, önerilen ürün ve keşif CTA'sı.",
    metric: "Seçici tamamlama + keşif talebi",
    href: "/urun-secici",
    cta: "Ürün Seçici"
  },
  {
    label: "Evren C",
    title: "Kurumsal karar",
    audience: "Site yöneticisi, işletme, filo ve yatırımcı",
    trigger: "Teklif, saha keşfi, RFID/OCPP ve ROI dili netleşirse lead kalitesi yükselir.",
    design: "Segment kartları, teklif formu, teknik gereksinim özeti ve yönetim dili.",
    metric: "Teklif formu + saha görüşmesi",
    href: "/iletisim?reason=Kurumsal%20teklif",
    cta: "Teklif Al"
  }
] as const;

export const premiumExperiencePillars = [
  {
    label: "Güven konsolu",
    title: "Ödeme, kargo ve kurulum sinyali aynı ekranda.",
    body: "PayTR, 81 il kargo, uzman destek ve sipariş takibi görünür kalarak satın alma kaygısını azaltır.",
    proof: "Risk azaltma"
  },
  {
    label: "Karar motoru",
    title: "Kullanıcı ürün aramaz; uygun çözüm yolunu seçer.",
    body: "Ev, site, işletme ve aksesuar alıcısı farklı karar evrenlerine ayrılır; mağaza seçici ilgili ürünleri öne çıkarır.",
    proof: "Daha hızlı yön bulma"
  },
  {
    label: "E-ticaret hızı",
    title: "Fiyat, stok, CTA ve ürün kanıtı gereksiz metinden önce gelir.",
    body: "Kompakt kartlar, hızlı filtreler, mobil satın alma bari ve kısa ürün özeti satış sürtünmesini düşürür.",
    proof: "Sepete ekleme odağı"
  },
  {
    label: "Operasyon takibi",
    title: "Sipariş, keşif, kurulum ve destek tek yolculukta izlenir.",
    body: "Müşteri paneli ve admin akışı satış sonrası güveni tamamlayan servis işletim sistemi gibi çalışır.",
    proof: "Satış sonrası güven"
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
