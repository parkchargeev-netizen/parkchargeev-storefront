import type { ProductDetailContentInput } from "@/lib/product-detail-content";
import type { ProductMediaKind } from "@/lib/product-media";
import { evChargingArticles } from "@/lib/ev-charging-articles";

export type ProductSpec = {
  groupName?: string;
  label: string;
  value: string;
};

export type ProductVariantModel = {
  id?: string;
  sku: string;
  title: string;
  powerLabel?: string;
  cableLength?: string;
  connectorType?: string;
  stockQuantity: number;
  priceKurus: number;
  compareAtKurus?: number;
  isDefault?: boolean;
};

export type ProductMediaModel = {
  url: string;
  altText: string;
  mediaType: ProductMediaKind;
  isPrimary?: boolean;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ProductModel = {
  id: string;
  slug: string;
  updatedAt?: string;
  name: string;
  category: string;
  badge?: string;
  summary: string;
  description: string;
  priceKurus: number;
  compareAtKurus?: number;
  stockLabel: "Stokta" | "Az Stok" | "Stokta Yok";
  powerLabel: string;
  cableOptions: string[];
  variants?: ProductVariantModel[];
  imageUrl?: string;
  media?: ProductMediaModel[];
  galleryItems?: string[];
  detailContent?: ProductDetailContentInput;
  specs: ProductSpec[];
  highlights: string[];
  useCases: string[];
  seoIntent: string[];
  faqs: FaqItem[];
};

export type ServiceModel = {
  id: string;
  title: string;
  summary: string;
  cta: string;
  href: string;
};

export type SolutionModel = {
  id: string;
  slug: string;
  title: string;
  segment: string;
  summary: string;
  heroMetric: string;
  heroLabel: string;
  introduction: string;
  features: string[];
  outcomes: string[];
  useCases: string[];
  faq: FaqItem[];
};

export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ArticleModel = {
  id: string;
  slug: string;
  updatedAt?: string;
  title: string;
  category: string;
  excerpt: string;
  coverKicker: string;
  publishedAt: string;
  readingMinutes: number;
  seoDescription: string;
  sections: ArticleSection[];
  faq?: FaqItem[];
  relatedSolutionSlug?: string;
};

export type TrustMetricModel = {
  label: string;
  value: string;
  detail: string;
};

export type TestimonialModel = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
};

export const trustMetrics: TrustMetricModel[] = [
  {
    label: "Ürün kargosu",
    value: "81 il",
    detail: "Şarj cihazı ve aksesuar gönderimi Türkiye'nin 81 iline yapılır"
  },
  {
    label: "Pazar momentumu",
    value: "%17,7",
    detail: "ODMD 6 Ocak 2026 verisine göre tam elektrikli otomobil payı"
  },
  {
    label: "Şarj altyapısı",
    value: "39.694",
    detail: "AA'nın 20 Şubat 2026 tarihli haberinde aktarılan toplam soket sayısı"
  },
  {
    label: "Servis disiplini",
    value: "7/24",
    detail: "Satış öncesi uygunluk, kurulum sonrası destek ve teknik servis standardı"
  }
];

export const products: ProductModel[] = [
  {
    id: "prod_homecharge_pro_11",
    slug: "homecharge-pro-11kw",
    name: "HomeCharge Pro 11kW",
    category: "Ev Tipi",
    badge: "Çok Satan",
    summary:
      "Trifaze altyapılı ev ve villalarda her sabah hazır araç isteyen kullanıcılar için akıllı wallbox.",
    description:
      "HomeCharge Pro 11kW; Togg, Tesla, BYD ve Type 2 AC uyumlu araçlarda evde güvenli şarj, zamanlama, enerji takibi ve keşifle netleşen kurulum planını tek satın alma akışında birleştirir.",
    priceKurus: 1249000,
    compareAtKurus: 1399000,
    stockLabel: "Stokta",
    powerLabel: "11kW AC",
    cableOptions: ["5 Metre", "7.5 Metre (+800 TL)"],
    galleryItems: ["Ön görünüm", "Yan profil", "Montaj görünümü", "Video"],
    variants: [
      {
        sku: "SKU-HOMECHARGE-PRO-11KW-5M",
        title: "5 Metre kablo",
        powerLabel: "11kW AC",
        cableLength: "5 Metre",
        connectorType: "Type 2",
        stockQuantity: 12,
        priceKurus: 1249000,
        compareAtKurus: 1399000,
        isDefault: true
      },
      {
        sku: "SKU-HOMECHARGE-PRO-11KW-75M",
        title: "7.5 Metre kablo",
        powerLabel: "11kW AC",
        cableLength: "7.5 Metre (+800 TL)",
        connectorType: "Type 2",
        stockQuantity: 8,
        priceKurus: 1329000,
        compareAtKurus: 1479000
      }
    ],
    specs: [
      { label: "Maksimum Güç", value: "11 kW (3-Faz)" },
      { label: "Bağlantı Tipi", value: "Type 2" },
      { label: "Bağlantı", value: "Wi-Fi, Bluetooth" },
      { label: "Koruma", value: "IP55" },
      { label: "Kurulum", value: "İç ve dış ortam uyumlu" }
    ],
    highlights: [
      "Gece şarjı için zamanlama ve enerji takibi",
      "Pano yükünü korumaya yardımcı dinamik dengeleme desteği",
      "Ev/villa kurulumu için keşif ve montaj danışmanlığı"
    ],
    useCases: ["Müstakil ev", "Villa", "Kapalı otopark", "Yazlık / ikinci konut"],
    seoIntent: [
      "ev tipi şarj cihazı",
      "11 kW wallbox fiyatı",
      "evde elektrikli araç şarj cihazı"
    ],
    faqs: [
      {
        question: "11 kW wallbox ev kullanımı için uygun mu?",
        answer:
          "Üç faz altyapısı bulunan konutlarda 11 kW wallbox hem hız hem de uzun vadeli kullanım dengesi açısından en çok tercih edilen güç aralığıdır."
      },
      {
        question: "Kurulum öncesinde keşif gerekli mi?",
        answer:
          "Evet. Pano kapasitesi, kablo hattı, kaçak akım koruması ve montaj lokasyonu kurulum güvenliği için keşifte netleştirilmelidir."
      }
    ]
  },
  {
    id: "prod_business_dual_22",
    slug: "business-charge-dual-22kw",
    name: "Business Charge Dual 22kW",
    category: "İş Yeri Tipi",
    badge: "Kurumsal",
    summary:
      "Site, ofis ve ortak otoparklarda RFID, raporlama ve çoklu kullanıcı yönetimi isteyen ekipler için 22 kW AC çözüm.",
    description:
      "Business Charge Dual 22kW; site yönetimleri, ofis otoparkları ve ticari alanlarda kullanıcı yetkisi, raporlama, OCPP uyumu ve servis destekli kurulum ihtiyacını tek cihazda toplar.",
    priceKurus: 3490000,
    stockLabel: "Stokta",
    powerLabel: "22kW AC",
    cableOptions: ["Soketli", "Kablolu"],
    specs: [
      { label: "Maksimum Güç", value: "22 kW (3-Faz)" },
      { label: "Soket", value: "Çift çıkışlı Type 2" },
      { label: "Yetkilendirme", value: "RFID / Mobil uygulama" },
      { label: "Yazılım", value: "OCPP uyumlu" },
      { label: "Kullanım", value: "Ticari ve çoklu kullanıcı" }
    ],
    highlights: [
      "RFID ile kullanıcı yetkilendirme ve kullanım takibi",
      "Ofis, site ve filo için ölçeklenebilir AC altyapı",
      "Kurumsal teklif ve keşif sürecine uygun teknik yapı"
    ],
    useCases: ["Site otoparkı", "Ofis otoparkı", "Otel", "AVM otoparkı"],
    seoIntent: [
      "22 kW şarj cihazı",
      "iş yeri şarj cihazı",
      "RFID şarj ünitesi"
    ],
    faqs: [
      {
        question: "İş yeri otoparkı için 22 kW cihaz yeterli olur mu?",
        answer:
          "Günlük kullanım yoğunluğuna bağlıdır. Uzun süreli park senaryolarında 22 kW AC cihazlar oldukça verimli bir yatırım dengesine sahiptir."
      },
      {
        question: "RFID yetkilendirme neden önemlidir?",
        answer:
          "RFID, çok kullanıcılı lokasyonlarda kullanım takibi ve yetkisiz erişimin önlenmesi için temel kontrol katmanıdır."
      }
    ]
  },
  {
    id: "prod_ecocharge_lite_74",
    slug: "ecocharge-lite-74kw",
    name: "EcoCharge Lite 7.4kW",
    category: "Ev Tipi",
    badge: "Yeni",
    summary:
      "Tek faz altyapılı evlerde uygun bütçeyle güvenli AC şarja başlamak isteyen yeni EV sahipleri için.",
    description:
      "EcoCharge Lite 7.4kW, apartman içi park alanı veya müstakil evlerde monofaze altyapıyla kontrollü, anlaşılır ve ekonomik ev tipi şarj deneyimi sunar.",
    priceKurus: 890000,
    stockLabel: "Az Stok",
    powerLabel: "7.4kW AC",
    cableOptions: ["5 Metre"],
    specs: [
      { label: "Maksimum Güç", value: "7.4 kW" },
      { label: "Faz", value: "Monofaze" },
      { label: "Kablo", value: "5 metre sabit kablo" },
      { label: "Koruma", value: "IP54" },
      { label: "Garanti", value: "2 Yıl" }
    ],
    highlights: [
      "Monofaze altyapıya uygun ekonomik başlangıç",
      "Kompakt gövde ve sade kullanım",
      "İlk EV sahipleri için keşifle netleşen kurulum"
    ],
    useCases: ["Apartman içi park alanı", "Tek araçlı hane", "İlk EV sahipleri"],
    seoIntent: [
      "7.4 kW şarj cihazı",
      "monofaze wallbox",
      "uygun fiyatlı ev tipi şarj cihazı"
    ],
    faqs: [
      {
        question: "7.4 kW cihaz apartman dairesi için uygun mudur?",
        answer:
          "Monofaze altyapısı olan birçok apartman projesinde 7.4 kW sınıfı cihazlar en pratik başlangıç çözümüdür."
      },
      {
        question: "Kurulum için özel bir elektrik altyapısı gerekir mi?",
        answer:
          "Kaçak akım koruması, uygun sigorta ve hat çekimi gereklilikleri keşif sırasında belirlenir. Her saha için kontrol önerilir."
      }
    ]
  },
  {
    id: "prod_dc_fast_60",
    slug: "dc-fast-60kw",
    name: "DC Fast 60kW",
    category: "DC Hızlı Şarj",
    badge: "Yeni Nesil",
    summary:
      "Akaryakıt, otel, AVM ve filo sahalarında hızlı şarjı gelir modeline dönüştürmek isteyen yatırımcılar için.",
    description:
      "DC Fast 60kW; yüksek araç sirkülasyonu olan ticari lokasyonlarda saha fizibilitesi, enerji kapasitesi, görünür kullanıcı deneyimi ve gelir odaklı hızlı şarj erişimi için tasarlanır.",
    priceKurus: 12990000,
    stockLabel: "Stokta",
    powerLabel: "60kW DC",
    cableOptions: ["CCS2 Tekli", "CCS2 Çiftli"],
    specs: [
      { label: "Çıkış Gücü", value: "60 kW DC" },
      { label: "Konnektör", value: "CCS2" },
      { label: "Kullanım", value: "Ticari / yüksek devirli lokasyon" },
      { label: "Ekran", value: "Dokunmatik yönetim ekranı" },
      { label: "Yönetim", value: "Uzaktan erişim ve raporlama" }
    ],
    highlights: [
      "Ticari gelir modeli için güçlü DC başlangıç yatırımı",
      "Görünür ekran ve kullanıcı yönlendirmesi",
      "Filo, rota üstü ve halka açık kullanım senaryolarına uygun"
    ],
    useCases: ["Benzinlik", "AVM", "Halka açık otopark"],
    seoIntent: ["DC hızlı şarj cihazı", "60 kW DC ünite", "ticari şarj cihazı"],
    faqs: [
      {
        question: "DC hızlı şarj cihazı kimler için uygundur?",
        answer:
          "Yüksek araç sirkülasyonu olan ve hızlı şarj deneyimi sunmak isteyen ticari lokasyonlar için uygundur."
      },
      {
        question: "DC yatırımında saha etüdü neden kritiktir?",
        answer:
          "Trafo kapasitesi, enerji sözleşmesi, saha güvenliği ve operatör modeli yatırımın geri dönüşünü doğrudan etkiler."
      }
    ]
  },
  {
    id: "prod_type2_5m",
    slug: "type-2-sarj-kablosu-5m",
    name: "Type-2 Şarj Kablosu 5m",
    category: "Aksesuar",
    summary:
      "Type 2 AC uyumlu araçlarda günlük kullanım, yedek taşıma ve ev/ofis şarjı için net kablo seçimi.",
    description:
      "Type-2 Şarj Kablosu 5m; araç teslimi sonrası hızlıca hazır olmak, ev/ofis cihazına bağlanmak ve seyahatte yedek ekipman taşımak isteyen kullanıcılar için dayanıklı bir tamamlayıcıdır.",
    priceKurus: 425000,
    stockLabel: "Stokta",
    powerLabel: "32A",
    cableOptions: ["5 Metre"],
    specs: [
      { label: "Akım", value: "32A" },
      { label: "Uyumluluk", value: "Type 2" },
      { label: "Uzunluk", value: "5 metre" },
      { label: "Kullanım", value: "AC şarj" },
      { label: "Taşıma", value: "Çanta dahil" }
    ],
    highlights: [
      "Type 2 AC uyumluluğu kolay kontrol edilir",
      "Günlük kullanım ve seyahat için taşıma çantası",
      "Araç teslimi sonrası hızlı tamamlayıcı ürün"
    ],
    useCases: ["Yedek ekipman", "Seyahat", "Günlük araç bagajı"],
    seoIntent: ["type 2 şarj kablosu", "5 metre şarj kablosu", "32A type 2 kablo"],
    faqs: [
      {
        question: "Type 2 kablo hangi araçlarla uyumludur?",
        answer:
          "Type 2 AC soket kullanan araç ve AC şarj cihazlarıyla uyumludur. Satın almadan önce araç giriş tipinin doğrulanması gerekir."
      },
      {
        question: "Yedek kablo kullanmak neden avantaj sağlar?",
        answer:
          "Ev, iş yeri ve seyahat senaryolarında kesintisiz kullanım için bir yedek kablo ciddi operasyonel kolaylık sağlar."
      }
    ]
  }
];

export const services: ServiceModel[] = [
  {
    id: "svc_installation",
    title: "Şarj Ünitesi Kurulumu",
    summary:
      "Pano, faz, kablo hattı, koruma ekipmanı, montaj, test ve devreye alma adımlarını uçtan uca yönetiyoruz.",
    cta: "Kurulumu Planla",
    href: "/hizmetler"
  },
  {
    id: "svc_support",
    title: "7/24 Teknik Servis",
    summary:
      "Kurulum sonrası kullanım, arıza, bakım, uzaktan destek ve periyodik kontrol süreçlerini görünür tutuyoruz.",
    cta: "Destek Al",
    href: "/iletisim"
  },
  {
    id: "svc_corporate",
    title: "Kurumsal Çözümler ve Filo",
    summary:
      "Site, ofis, AVM, otopark ve filo projeleri için cihaz, RFID/yönetim, kurulum ve servis planı tasarlıyoruz.",
    cta: "Kurumsal Akışı Gör",
    href: "/kurumsal-cozumler"
  },
  {
    id: "svc_consulting",
    title: "Enerji Danışmanlığı",
    summary:
      "Elektrik altyapısı, güç ihtiyacı, saha fizibilitesi, maliyet optimizasyonu ve büyüme planı için mühendislik desteği sunuyoruz.",
    cta: "Fizibilite İste",
    href: "/iletisim"
  }
];

export const solutionPages: SolutionModel[] = [
  {
    id: "sol_apartment",
    slug: "site-ve-apartman",
    title: "Site ve Apartman Çözümleri",
    segment: "B2B2C",
    summary:
      "Ortak otoparklarda mevzuata, kapasiteye ve kullanıcı yönetimine uygun şarj altyapısı.",
    heroMetric: "Çoklu kullanıcı",
    heroLabel: "Yetkilendirme ve yük yönetimi",
    introduction:
      "Site ve apartman projelerinde karar vericiler için en kritik başlıklar; elektrik altyapısının yeterliliği, adil kullanım modeli ve ileride büyümeye açık kurgu oluşturmaktır.",
    features: [
      "Otopark keşfi ve pano kapasite analizi",
      "Dağıtılmış kullanıcı yetkilendirme modeli",
      "Dinamik yük dengeleme planı",
      "Aidat ve kullanım ayrıştırmasına uygun kurgu"
    ],
    outcomes: [
      "Yönetim planına uygun teklif sunumu",
      "Kurulum sonrası kullanım görünürlüğü",
      "Yeni kullanıcı eklendiğinde ölçeklenebilir saha tasarımı"
    ],
    useCases: ["Site yönetimi", "Rezidans", "Yeni konut projeleri"],
    faq: [
      {
        question: "Apartman otoparkına şarj cihazı kurmak için ne gerekir?",
        answer:
          "Elektrik kapasitesi, kablo güzergahı, ortak alan onayı ve kullanıcı yönetim modeli birlikte değerlendirilmelidir."
      },
      {
        question: "Her daire için ayrı sayaç gerekir mi?",
        answer:
          "Her proje için zorunlu değildir. Ancak faturalandırma modeli ve yönetim tercihlerine göre ayrı ölçüm altyapısı önerilebilir."
      }
    ]
  },
  {
    id: "sol_office",
    slug: "is-yeri-ve-ofis",
    title: "İş Yeri ve Ofis Çözümleri",
    segment: "B2B",
    summary:
      "Çalışan memnuniyeti, ziyaretçi deneyimi ve sürdürülebilirlik hedeflerini destekleyen akıllı iş yeri şarj altyapısı.",
    heroMetric: "%100 görünürlük",
    heroLabel: "Kullanım ve maliyet raporlama",
    introduction:
      "İş yeri projelerinde şarj altyapısı yalnızca bir tesis yatırımı değil; marka algısı, çalışan bağlılığı ve sürdürülebilirlik iletişimi için önemli bir temas noktasıdır.",
    features: [
      "Çalışan ve misafir için ayrı yetkilendirme akışları",
      "Ofis otoparkı için vardiya uyumlu planlama",
      "Aşamalı kapasite büyütme senaryosu",
      "CSR ve ESG iletişimine uygun veri çıktısı"
    ],
    outcomes: [
      "Çalışan deneyiminde görünür artış",
      "Enerji tüketimi ve kullanım oranı takibi",
      "Genişlemeye uygun kurumsal saha standardı"
    ],
    useCases: ["Ofis kampüsü", "Teknoloji firması", "Ziyaretçi otoparkı"],
    faq: [
      {
        question: "İş yeri otoparkında kaç adet cihazla başlanmalı?",
        answer:
          "Araç yoğunluğu, park süresi ve büyüme hedefi analiz edilerek aşamalı başlangıç önerilir. İlk fazda kullanım verisi toplamak kritik değer yaratır."
      },
      {
        question: "Çalışan ve misafir kullanımı ayrı izlenebilir mi?",
        answer:
          "Evet. RFID, uygulama veya kullanıcı bazlı yetkilendirme ile farklı profiller ayrı raporlanabilir."
      }
    ]
  },
  {
    id: "sol_fleet",
    slug: "filo-ve-otopark",
    title: "Filo ve Otopark Çözümleri",
    segment: "B2B",
    summary:
      "Ticari araç filoları ve halka açık otoparklar için yüksek devirli, operasyonel olarak ölçülebilir şarj mimarisi.",
    heroMetric: "Operasyonel verim",
    heroLabel: "Saha, yazılım ve servis birlikte",
    introduction:
      "Filo projelerinde en kritik konu yalnızca cihaz seçimi değildir. Operasyon planı, araç dönüş frekansı, enerji dağıtımı ve bakım SLA kurgusu birlikte tasarlanmalıdır.",
    features: [
      "Filo vardiyası ve rota planına uygun güç tasarımı",
      "DC ve AC hibrit saha planlaması",
      "Önleyici bakım ve servis standardı",
      "Kullanım yoğunluğuna göre kapasite artırımı"
    ],
    outcomes: [
      "Şarj kaynaklı operasyon aksamasını azaltma",
      "Araç başına enerji maliyetini görünür kılma",
      "Saha yatırımını veriyle optimize etme"
    ],
    useCases: ["Teslimat filoları", "Araç kiralama", "Açık otopark işletmeleri"],
    faq: [
      {
        question: "Filo operasyonunda AC mi DC mi seçilmeli?",
        answer:
          "Araçların park süresi ve günlük kilometre ihtiyacı kararın temelidir. Gece park eden filolarda AC, hızlı dönüş gerektiren senaryolarda DC daha uygundur."
      },
      {
        question: "Bakım anlaşması gerekli mi?",
        answer:
          "Yüksek kullanım yoğunluğunda bakım anlaşması arıza süresini düşürmek ve gelir kaybını önlemek için güçlü bir güvenlik katmanıdır."
      }
    ]
  }
];

export const articles: ArticleModel[] = [
  ...evChargingArticles,
  {
    id: "art_ev_charger_selection",
    slug: "elektrikli-arac-sarj-cihazi-secim-rehberi",
    title:
      "Elektrikli Araç Şarj Cihazı Seçim Rehberi: Ev Tipi, 7.4 kW, 11 kW ve 22 kW",
    category: "Satın Alma Rehberi",
    excerpt:
      "Elektrikli araç şarj cihazı seçerken güç, araç uyumu, faz yapısı, Type 2 bağlantı ve kurulum maliyetini birlikte değerlendirmenizi sağlayan kapsamlı rehber.",
    coverKicker: "Elektrikli Araç Şarj Cihazları",
    publishedAt: "2026-06-24",
    updatedAt: "2026-06-24",
    readingMinutes: 10,
    seoDescription:
      "Elektrikli araç şarj cihazı ve ev tipi şarj aleti seçimi için 7.4 kW, 11 kW ve 22 kW farklarını, fiyatı etkileyen unsurları ve kurulum gereksinimlerini öğrenin.",
    sections: [
      {
        heading: "Elektrikli araç şarj aleti mi, şarj cihazı mı?",
        paragraphs: [
          "Günlük aramalarda elektrikli araç şarj aleti ifadesi sık kullanılır. Teknik ve ticari ürün sınıflandırmasında ise elektrikli araç şarj cihazı, EV charger veya ev tipi sabit ürünlerde wallbox ifadeleri tercih edilir.",
          "Bu isimler çoğu aramada aynı ihtiyacı anlatır. Satın alma kararında asıl önemli olan cihazın AC veya DC olması, güç seviyesi, aracın bağlantı tipi, elektrik altyapısı ve güvenli kurulum şartlarıdır."
        ]
      },
      {
        heading: "7.4 kW, 11 kW ve 22 kW arasından hangisi seçilmeli?",
        paragraphs: [
          "7.4 kW cihazlar monofaze altyapıda ev kullanımı için pratik bir başlangıç sunar. Araç gece boyunca park ediyorsa günlük enerji ihtiyacının önemli bölümünü karşılayabilir.",
          "11 kW wallbox, trifaze altyapıya sahip ev ve iş yerlerinde hız ile altyapı maliyeti arasında dengeli bir seçenektir. 22 kW ise kısa park süresi veya daha yoğun kullanım senaryolarında anlamlı olabilir."
        ],
        bullets: [
          "7.4 kW: monofaze evler ve uzun gece parkı",
          "11 kW: trifaze ev, villa ve dengeli günlük kullanım",
          "22 kW: uygun araç ve altyapıda iş yeri veya yoğun kullanım"
        ]
      },
      {
        heading: "Cihaz gücü aracın gerçek şarj hızını tek başına belirlemez",
        paragraphs: [
          "Bir aracın AC şarjda alabileceği güç, araç üzerindeki dahili şarj ünitesinin kapasitesiyle sınırlıdır. 22 kW cihaz satın almak, araç yalnızca 11 kW AC kabul ediyorsa şarj hızını 22 kW'a çıkarmaz.",
          "Bu nedenle araç modeli, bağlantı standardı ve maksimum AC kabul gücü ürün seçmeden önce kontrol edilmelidir. Type 2 bağlantı yaygın olsa da güç ve faz desteği araçtan araca değişebilir."
        ]
      },
      {
        heading: "Elektrik altyapısı ve kurulum neden birlikte değerlendirilir?",
        paragraphs: [
          "Sabit bir şarj cihazı yüksek süreli elektrik yükü oluşturur. Elektrik panosu, faz yapısı, mevcut güç, kablo kesiti, hat mesafesi, kaçak akım koruması ve montaj alanı güvenli kurulum için birlikte incelenmelidir.",
          "Teknik keşif, gereğinden yüksek güçlü cihaz alınmasını veya kurulum sırasında beklenmeyen pano ve kablo maliyetleri çıkmasını önlemeye yardımcı olur."
        ],
        bullets: [
          "Pano ve abonelik gücü",
          "Monofaze veya trifaze altyapı",
          "Kablo güzergahı ve mesafesi",
          "Koruma ekipmanları",
          "Kapalı veya açık montaj alanı"
        ]
      },
      {
        heading: "Elektrikli araç şarj cihazı fiyatını neler etkiler?",
        paragraphs: [
          "Cihaz fiyatı güç seviyesine ek olarak sabit kablo veya soket seçimi, kablo uzunluğu, RFID, Wi-Fi, mobil uygulama, yük yönetimi, koruma sınıfı ve ticari yönetim özelliklerine göre değişir.",
          "Toplam yatırım hesabında yalnızca ürün bedeline bakılmamalıdır. Kablo hattı, pano düzenlemesi, koruma elemanları, montaj ve devreye alma ayrı kalemler olarak değerlendirilmelidir."
        ]
      },
      {
        heading: "Satın almadan önce kısa kontrol listesi",
        paragraphs: [
          "Doğru ürün, en yüksek güce sahip ürün değil; aracın, elektrik altyapısının ve günlük kullanım alışkanlığının birlikte desteklediği üründür."
        ],
        bullets: [
          "Aracın AC şarj kapasitesini doğrulayın.",
          "Type 2 veya diğer bağlantı tipini kontrol edin.",
          "Günlük kilometre ve park süresini hesaplayın.",
          "Elektrik altyapısı için teknik ön değerlendirme alın.",
          "Cihaz ve kurulum maliyetini ayrı ayrı gösteren teklif isteyin.",
          "Garanti ve satış sonrası teknik destek kapsamını inceleyin."
        ]
      }
    ],
    faq: [
      {
        question: "Ev tipi elektrikli araç şarj cihazı kaç saatte şarj eder?",
        answer:
          "Süre; araç bataryasının kapasitesine, mevcut doluluk oranına, aracın kabul ettiği AC güce ve cihaz gücüne bağlıdır. Aynı 11 kW wallbox farklı araçlarda farklı sürelerde sonuç verebilir."
      },
      {
        question: "22 kW şarj cihazı her elektrikli araç için uygun mudur?",
        answer:
          "Type 2 bağlantı fiziksel olarak uyumlu olsa bile her araç 22 kW AC kabul etmez. Aracın dahili şarj kapasitesi ve tesisat uygunluğu kontrol edilmeden yalnızca yüksek güce göre karar verilmemelidir."
      },
      {
        question: "Taşınabilir şarj aleti mi sabit wallbox mı seçilmeli?",
        answer:
          "Taşınabilir ürünler yedek veya seyahat çözümü olabilir. Düzenli ev şarjında sabit wallbox; özel hat, koruma ekipmanı, daha kontrollü kullanım ve montaj disiplini açısından daha uygun olabilir."
      }
    ]
  },
  {
    id: "art_home_installation",
    slug: "evde-elektrikli-arac-sarj-cihazi-kurulumu",
    title: "Evde Elektrikli Araç Şarj Cihazı Kurulumu Nasıl Planlanır?",
    category: "Kurulum Rehberi",
    excerpt:
      "Ev tipi wallbox kurulumu öncesinde pano kapasitesi, hat uzunluğu, koruma ekipmanları ve cihaz gücü nasıl değerlendirilir sorusunu netleştiren temel rehber.",
    coverKicker: "Kurulum Rehberi",
    publishedAt: "2026-04-21",
    readingMinutes: 8,
    seoDescription:
      "Evde elektrikli araç şarj cihazı kurulumu için cihaz seçimi, altyapı kontrolü ve güvenli kurulum adımlarını öğrenin.",
    sections: [
      {
        heading: "1. Doğru güç seçimi neden ilk adımdır?",
        paragraphs: [
          "Ev tipi şarj altyapısında doğru güç seviyesi, sadece aracın batarya kapasitesine göre belirlenmez. Elektrik aboneliği, mevcut pano yapısı ve kullanım alışkanlığı birlikte değerlendirilmelidir.",
          "Monofaze altyapıda 7.4 kW, üç faz altyapıda 11 kW çoğu hane için dengeli başlangıç noktasıdır. 22 kW ise her konut tipi için gerekli değildir."
        ],
        bullets: [
          "Araç günlük ne kadar yol yapıyor?",
          "Araç gece boyunca ne kadar süre parkta kalıyor?",
          "Mevcut tesisat üç faz destekliyor mu?"
        ]
      },
      {
        heading: "2. Kurulum öncesi saha keşfinde neye bakılır?",
        paragraphs: [
          "Kurulum ekibinin saha keşfinde bakacağı ana konular; pano kapasitesi, kablo çekim güzergahı, cihazın dış etkenlere maruz kalma durumu ve koruma ekipmanlarıdır.",
          "Bu aşama atlandığında hem maliyet sapması hem de güvenlik riski oluşur. Bu yüzden her satış süreci teknik keşif ile desteklenmelidir."
        ]
      },
      {
        heading: "3. Karar verirken yalnızca cihaz fiyatına odaklanmayın",
        paragraphs: [
          "Şarj cihazı seçimi toplam kurulum maliyetinin yalnızca bir bölümüdür. Kablo hattı, pano ilavesi, koruma elemanları ve işçilik de toplam yatırımın parçasıdır.",
          "Doğru teklif modeli, ürün fiyatını kurulum kapsamı ile birlikte açıkça ayırarak sunmalıdır."
        ]
      }
    ],
    faq: [
      {
        question: "Ev tipi wallbox için ruhsat veya özel izin gerekir mi?",
        answer:
          "Bireysel konutlarda çoğu senaryoda özel ruhsat gerekmez; ancak apartman ortak alanlarında yönetim onayı ve ortak kullanım kuralları dikkate alınmalıdır."
      },
      {
        question: "Kurulum ne kadar sürer?",
        answer:
          "Saha şartlarına bağlı olarak standart ev kurulumları genellikle aynı gün içinde tamamlanabilir. Ek pano veya uzun hat ihtiyacı süreyi uzatabilir."
      }
    ],
    relatedSolutionSlug: "site-ve-apartman"
  },
  {
    id: "art_11kw_vs_22kw",
    slug: "11kw-ve-22kw-sarj-cihazi-farki",
    title: "11 kW ve 22 kW Şarj Cihazı Arasındaki Fark Nedir?",
    category: "Karşılaştırma",
    excerpt:
      "11 kW ile 22 kW arasında seçim yaparken sadece hız değil, altyapı uyumu, maliyet ve kullanım senaryosu birlikte değerlendirilmelidir.",
    coverKicker: "Karşılaştırma",
    publishedAt: "2026-04-21",
    readingMinutes: 6,
    seoDescription:
      "11 kW ve 22 kW şarj cihazı farklarını; hız, altyapı ihtiyacı, maliyet ve kullanım senaryoları açısından karşılaştırın.",
    sections: [
      {
        heading: "1. 11 kW çoğu kullanıcı için neden yeterlidir?",
        paragraphs: [
          "Günlük kullanım sonrasında araç gece boyunca parkta kalıyorsa 11 kW sınıfı wallbox çoğu kullanıcı için hem pratik hem de ekonomik çözümdür.",
          "22 kW her zaman daha iyi anlamına gelmez; çünkü aracın onboard charger kapasitesi ve altyapı uygunluğu gerçek verimi belirler."
        ]
      },
      {
        heading: "2. 22 kW hangi senaryoda mantıklıdır?",
        paragraphs: [
          "İş yeri otoparkı, hızlı dönüş ihtiyacı olan ticari lokasyonlar ve çok kullanıcılı alanlar 22 kW yatırımını daha anlamlı hale getirir.",
          "Bireysel kullanıcıda ise bu güç seviyesi çoğu zaman altyapı maliyeti ile birlikte yeniden değerlendirilmelidir."
        ],
        bullets: [
          "Kısa park süresi",
          "Yüksek kullanıcı sirkülasyonu",
          "Üç faz ve uygun tesisat"
        ]
      }
    ],
    faq: [
      {
        question: "22 kW cihaz kullanmak için aracın da bunu desteklemesi gerekir mi?",
        answer:
          "Evet. Aracın AC onboard charger kapasitesi cihazdan alınabilecek fiili gücü belirler."
      }
    ],
    relatedSolutionSlug: "is-yeri-ve-ofis"
  },
  {
    id: "art_apartment_installation",
    slug: "apartman-otoparkina-sarj-cihazi-kurulumu",
    title: "Apartman Otoparkına Şarj Cihazı Kurulumu İçin Yol Haritası",
    category: "Kurumsal Çözüm",
    excerpt:
      "Apartman ve site projelerinde teknik uygunluk, kullanıcı modeli ve yönetim kararı birlikte ele alınmalıdır.",
    coverKicker: "Site Yönetimi",
    publishedAt: "2026-04-21",
    readingMinutes: 9,
    seoDescription:
      "Apartman otoparkına şarj cihazı kurulumu için teknik keşif, yönetim planı, maliyet ve kullanıcı yönetimi modelini öğrenin.",
    sections: [
      {
        heading: "1. Ortak alan gerçeğini doğru ele alın",
        paragraphs: [
          "Apartman projelerinde şarj altyapısı kararı yalnızca bir cihaz satın alma kararı değildir. Ortak alan kullanımı, enerji dağıtımı ve ileride sisteme eklenecek yeni kullanıcıların yönetimi birlikte düşünülmelidir.",
          "Bu nedenle cihaz markasından önce altyapı ve yönetim modeli konuşulmalıdır."
        ]
      },
      {
        heading: "2. En kritik risk plansız kablo mimarisidir",
        paragraphs: [
          "İlk kurulum tek araç için yapılsa bile gelecekte artacak talep düşünülerek kablo güzergahı ve pano planı tasarlanmalıdır.",
          "Plansız ilerleyen projeler, ikinci ve üçüncü kullanıcı eklendiğinde hızla karmaşık ve maliyetli hale gelir."
        ]
      },
      {
        heading: "3. Yönetime sunulacak teklif nasıl olmalı?",
        paragraphs: [
          "Teklif yalnızca ürün fiyatı değil; keşif, elektrik altyapısı, kullanıcı yönetimi, bakım ve genişleme planını aynı belge içinde göstermelidir.",
          "Bu yaklaşım karar vericiler için güven yaratır ve teklifin satın alma olasılığını yükseltir."
        ]
      }
    ],
    faq: [
      {
        question: "Site yönetimi onayı olmadan kurulum yapılabilir mi?",
        answer:
          "Ortak alan kullanımını etkileyen projelerde yönetim kararı ve uygulama modeli değerlendirilmeden ilerlemek risklidir. Hukuki ve operasyonel netlik önerilir."
      }
    ],
    relatedSolutionSlug: "site-ve-apartman"
  }
];

export const testimonials: TestimonialModel[] = [
  {
    id: "tsm_1",
    name: "Mert Yılmaz",
    role: "Site Yöneticisi",
    company: "Sakarya Residence",
    quote:
      "Kurulum öncesinde yalnızca cihaz konuşulmadı; pano kapasitesi, kullanıcı yetkisi ve büyüme planı birlikte ele alındı. Yönetim kuruluna sunmak kolaylaştı."
  },
  {
    id: "tsm_2",
    name: "İrem Kaya",
    role: "İdari İşler Müdürü",
    company: "Teknoloji Kampüsü",
    quote:
      "İş yeri şarj altyapısını yalnızca çalışan memnuniyeti değil, ölçülebilir operasyon yatırımı gibi kurgulamak bizim için fark yarattı."
  },
  {
    id: "tsm_3",
    name: "Can Demir",
    role: "Filo Operasyon Sorumlusu",
    company: "Şehir Lojistik",
    quote:
      "DC ve AC karmasını doğru planlamak, vardiya düzenimizi korumamıza yardımcı oldu. Servis yaklaşımı en az cihaz kadar önemliydi."
  }
];

export const globalFaqs: FaqItem[] = [
  {
    question: "ParkChargeEV yalnızca ürün mü satar, yoksa kurulum da yapar mı?",
    answer:
      "Evet. Ürün satışı, teknik keşif, kurulum, garanti/servis desteği ve kurumsal proje danışmanlığı tek satın alma akışında birlikte ilerleyebilir."
  },
  {
    question: "PayTR ile ödeme güvenli mi?",
    answer:
      "Ödeme akışı PayTR iFrame üzerinden çalıştığı için kart verisi siteye değil, güvenli ödeme sağlayıcısına iletilir. Sipariş doğrulaması callback ile yapılmalıdır."
  },
  {
    question: "Kurumsal projeler için teklif süreci nasıl ilerler?",
    answer:
      "İlk aşamada ihtiyaç formu alınır, ardından teknik keşif ve kullanım senaryosu değerlendirilir. Sonrasında cihaz, kurulum ve servis kapsamı ayrıştırılmış teklif sunulur."
  }
];

export const contactReasons = [
  "Ücretsiz keşif talebi",
  "Ev tipi kurulum talebi",
  "İş yeri / ofis projesi",
  "Site / apartman çözümü",
  "Filo / otopark projesi",
  "Teknik servis ve bakım",
  "Bayilik / iş ortaklığı",
  "Genel bilgi talebi"
] as const;

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: ProductModel, limit = 3) {
  return products
    .filter((candidate) => candidate.slug !== product.slug)
    .sort((left, right) => {
      const leftScore = left.category === product.category ? 1 : 0;
      const rightScore = right.category === product.category ? 1 : 0;
      return rightScore - leftScore;
    })
    .slice(0, limit);
}

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getRelatedArticles(article: ArticleModel, limit = 2) {
  return articles
    .filter((candidate) => candidate.slug !== article.slug)
    .slice(0, limit);
}

export function getSolutionBySlug(slug: string) {
  return solutionPages.find((solution) => solution.slug === slug);
}

export function getArticlesForSolution(slug: string) {
  return articles.filter((article) => article.relatedSolutionSlug === slug);
}
