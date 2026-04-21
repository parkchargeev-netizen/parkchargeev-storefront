export type ProductSpec = {
  label: string;
  value: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ProductModel = {
  id: string;
  slug: string;
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

export type StationModel = {
  id: string;
  name: string;
  distance: string;
  status: string;
  power: string;
  connectorTypes: string[];
  pricePerKwh: string;
  city: string;
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
    label: "Kurulum kapasitesi",
    value: "81 il",
    detail: "Bireysel ve kurumsal saha operasyonları için ölçeklenebilir hizmet modeli"
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
    detail: "Uzaktan destek, bakım ve teknik servis erişimi için önerilen operasyon standardı"
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
      "Akıllı telefon uygulaması ile uzaktan yönetilebilen, konut kullanımı için optimize edilmiş wallbox çözümü.",
    description:
      "Ev kullanıcıları için tasarlanan HomeCharge Pro 11kW; güvenli AC şarj, zamanlama, enerji takibi ve kompakt montaj avantajını tek gövdede birleştirir.",
    priceKurus: 1249000,
    compareAtKurus: 1399000,
    stockLabel: "Stokta",
    powerLabel: "11kW AC",
    cableOptions: ["5 Metre", "7.5 Metre (+800 TL)"],
    specs: [
      { label: "Maksimum Güç", value: "11 kW (3-Faz)" },
      { label: "Bağlantı Tipi", value: "Type 2" },
      { label: "Bağlantı", value: "Wi-Fi, Bluetooth" },
      { label: "Koruma", value: "IP55" },
      { label: "Kurulum", value: "İç ve dış ortam uyumlu" }
    ],
    highlights: [
      "Mobil uygulama ile zamanlama",
      "Dinamik yük dengeleme desteği",
      "Ücretsiz keşif ve montaj danışmanlığı"
    ],
    useCases: ["Müstakil ev", "Kapalı otopark", "Yazlık / ikinci konut"],
    seoIntent: [
      "ev tipi şarj istasyonu",
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
      "Aynı anda iki aracı şarj edebilen, RFID destekli ve çoklu kullanım senaryoları için tasarlanan ticari ünite.",
    description:
      "Kurumsal otopark, ofis ve ticari alanlarda çoklu araç kullanımını yönetmek için geliştirilen Business Charge Dual 22kW; yazılım entegrasyonu ve raporlama altyapısına hazırdır.",
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
      "Kurumsal raporlama desteği",
      "Çoklu kullanıcı ve yetkilendirme",
      "Ticari lokasyonlar için uygun"
    ],
    useCases: ["Ofis otoparkı", "Otel", "AVM otoparkı"],
    seoIntent: [
      "22 kW şarj istasyonu",
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
      "Monofaze altyapıya uygun, ilk EV kullanıcıları için ekonomik ve güvenli başlangıç çözümü.",
    description:
      "EcoCharge Lite 7.4kW, apartman veya müstakil evlerde kontrollü ve güvenli şarj isteyen kullanıcılar için tasarlanmış giriş seviyesi wallbox modelidir.",
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
      "Konut kurulumları için optimize edildi",
      "Kompakt gövde",
      "Kolay devreye alma"
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
      "Hızlı devirli ticari lokasyonlar için geliştirilen, yüksek görünürlük ve hızlı servis sunan DC çözüm.",
    description:
      "Akaryakıt istasyonu, otopark ve filo merkezleri için uygun DC Fast 60kW; gelir odaklı ticari kullanım senaryolarında hızlı şarj erişimi sağlar.",
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
      "Ticari gelir modeli için güçlü giriş seviyesi DC yatırım",
      "Görünür ekran ve kullanıcı yönlendirmesi",
      "Filo ve halka açık kullanım senaryolarına uygun"
    ],
    useCases: ["Benzinlik", "AVM", "Halka açık otopark"],
    seoIntent: ["DC hızlı şarj cihazı", "60 kW DC ünite", "ticari şarj istasyonu"],
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
      "32A destekli, dayanıklı dış kaplamaya sahip günlük kullanım ve yedek taşıma için uygun şarj kablosu.",
    description:
      "Ev, iş yeri ve istasyon kullanımına uygun Type-2 şarj kablosu; taşıma çantası ve sağlam bağlantı uçlarıyla güvenli bir yedek ekipman çözümüdür.",
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
      "Dayanıklı taşıma çözümü",
      "Günlük kullanıma uygun",
      "Yedek kablo senaryosu için ideal"
    ],
    useCases: ["Yedek ekipman", "Seyahat", "Günlük araç bagajı"],
    seoIntent: ["type 2 şarj kablosu", "5 metre şarj kablosu", "32A type 2 kablo"],
    faqs: [
      {
        question: "Type 2 kablo hangi araçlarla uyumludur?",
        answer:
          "Type 2 AC soket kullanan araç ve istasyonlarla uyumludur. Satın almadan önce araç giriş tipinin doğrulanması gerekir."
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
      "Keşif, altyapı analizi, montaj, test ve devreye alma adımlarını tek ekip ile yönetiyoruz.",
    cta: "Kurulum Detayları",
    href: "/hizmetler"
  },
  {
    id: "svc_support",
    title: "7/24 Teknik Servis",
    summary:
      "Kurulum sonrası arıza, bakım, uzaktan destek ve periyodik kontrol süreçlerini yönetiyoruz.",
    cta: "Destek Talebi",
    href: "/iletisim"
  },
  {
    id: "svc_corporate",
    title: "Kurumsal Çözümler ve Filo",
    summary:
      "Site, ofis, AVM, otopark ve filo projeleri için cihaz, kurulum ve yönetim senaryoları tasarlıyoruz.",
    cta: "Kurumsal Çözümleri İncele",
    href: "/kurumsal-cozumler"
  },
  {
    id: "svc_consulting",
    title: "Enerji Danışmanlığı",
    summary:
      "Elektrik altyapısı, güç ihtiyacı, maliyet optimizasyonu ve büyüme planı için mühendislik desteği sunuyoruz.",
    cta: "Danışmanlık Talebi",
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
      "Ortak otoparklarda mevzuata, kapasiteye ve kullanıcı yönetimine uygun EV charging mimarisi.",
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
        question: "Apartman otoparkına şarj istasyonu kurmak için ne gerekir?",
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
  {
    id: "art_home_installation",
    slug: "evde-elektrikli-arac-sarj-istasyonu-kurulumu",
    title: "Evde Elektrikli Araç Şarj İstasyonu Kurulumu Nasıl Planlanır?",
    category: "Kurulum Rehberi",
    excerpt:
      "Ev tipi wallbox kurulumu öncesinde pano kapasitesi, hat uzunluğu, koruma ekipmanları ve cihaz gücü nasıl değerlendirilir sorusunu netleştiren temel rehber.",
    coverKicker: "Kurulum Rehberi",
    publishedAt: "2026-04-21",
    readingMinutes: 8,
    seoDescription:
      "Evde elektrikli araç şarj istasyonu kurulumu için cihaz seçimi, altyapı kontrolü ve güvenli kurulum adımlarını öğrenin.",
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
    slug: "apartman-otoparkina-sarj-istasyonu-kurulumu",
    title: "Apartman Otoparkına Şarj İstasyonu Kurulumu İçin Yol Haritası",
    category: "Kurumsal Çözüm",
    excerpt:
      "Apartman ve site projelerinde teknik uygunluk, kullanıcı modeli ve yönetim kararı birlikte ele alınmalıdır.",
    coverKicker: "Site Yönetimi",
    publishedAt: "2026-04-21",
    readingMinutes: 9,
    seoDescription:
      "Apartman otoparkına şarj istasyonu kurulumu için teknik keşif, yönetim planı, maliyet ve kullanıcı yönetimi modelini öğrenin.",
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
      "Kurulum öncesinde sadece cihaz konuşulmadı; pano kapasitesi, kullanıcı yetkisi ve ileride büyüme planı birlikte ele alındı. Bu yaklaşım karar vermemizi kolaylaştırdı."
  },
  {
    id: "tsm_2",
    name: "İrem Kaya",
    role: "İdari İşler Müdürü",
    company: "Teknoloji Kampüsü",
    quote:
      "İş yeri şarj altyapısını çalışan memnuniyeti projesi gibi değil, ölçülebilir operasyon yatırımı gibi kurgulamak bizim için fark yarattı."
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

export const stations: StationModel[] = [
  {
    id: "station_zorlu",
    name: "Zorlu Center Şarj Noktası",
    distance: "1.2 km",
    status: "3 müsait",
    power: "180 kW",
    connectorTypes: ["CCS2", "Type 2"],
    pricePerKwh: "7.45 ₺ / kWh",
    city: "İstanbul"
  },
  {
    id: "station_kanyon",
    name: "Kanyon AVM Otopark",
    distance: "2.5 km",
    status: "Dolu",
    power: "50 kW",
    connectorTypes: ["CCS2"],
    pricePerKwh: "8.10 ₺ / kWh",
    city: "İstanbul"
  },
  {
    id: "station_istinye",
    name: "İstinyePark -3. Kat",
    distance: "4.1 km",
    status: "1 müsait",
    power: "300 kW",
    connectorTypes: ["CCS2", "CHAdeMO"],
    pricePerKwh: "9.40 ₺ / kWh",
    city: "İstanbul"
  }
];

export const globalFaqs: FaqItem[] = [
  {
    question: "ParkChargeEV yalnızca ürün mü satar, yoksa kurulum da yapar mı?",
    answer:
      "Önerilen proje modeli ürün satışı, keşif, kurulum, teknik destek ve kurumsal proje danışmanlığını tek çatı altında birleştirir."
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
