export type EvGuideCluster = {
  title: string;
  description: string;
  href: string;
  keywords: string[];
};

export type EvGlossaryTerm = {
  name: string;
  description: string;
  relatedHref: string;
};

export type InstallationLocation = {
  slug: string;
  city: string;
  districts: string[];
  title: string;
  description: string;
  introduction: string;
  localContext: string;
  process: Array<{
    title: string;
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

export const evGuideClusters: EvGuideCluster[] = [
  {
    title: "Elektrikli araç şarj cihazı seçimi",
    description:
      "Ev tipi şarj aleti, wallbox, 7.4 kW, 11 kW ve 22 kW seçeneklerini araç ve elektrik altyapısına göre karşılaştırın.",
    href: "/blog/elektrikli-arac-sarj-cihazi-secim-rehberi",
    keywords: [
      "elektrikli araç şarj cihazı",
      "elektrikli araç şarj aleti",
      "ev tipi şarj cihazı",
      "wallbox"
    ]
  },
  {
    title: "Şarj gücü ve süre hesabı",
    description:
      "Batarya kapasitesi, aracın dahili AC şarj ünitesi ve cihaz gücünün gerçek şarj süresini nasıl belirlediğini öğrenin.",
    href: "/blog/11kw-ve-22kw-sarj-cihazi-farki",
    keywords: ["11 kW şarj cihazı", "22 kW şarj cihazı", "şarj süresi"]
  },
  {
    title: "Evde ve apartmanda kurulum",
    description:
      "Pano kapasitesi, faz yapısı, kablo hattı, koruma ekipmanları ve ortak otopark planını birlikte değerlendirin.",
    href: "/blog/evde-elektrikli-arac-sarj-cihazi-kurulumu",
    keywords: [
      "evde elektrikli araç şarj",
      "şarj istasyonu kurulumu",
      "apartman otoparkı"
    ]
  },
  {
    title: "Şarj maliyeti hesabı",
    description:
      "kWh tüketimi, şarj kaybı ve elektrik birim fiyatı üzerinden evde şarj maliyetini hesaplayın.",
    href: "/blog/elektrikli-arac-sarj-maliyeti-hesaplama",
    keywords: [
      "elektrikli araç şarj maliyeti",
      "evde şarj maliyeti",
      "şarj maliyeti hesaplama"
    ]
  },
  {
    title: "Type 2, CCS2, AC ve DC",
    description:
      "Konnektör ile akım türünü birbirinden ayırın; ev, seyahat ve hızlı şarj senaryolarındaki farkları görün.",
    href: "/blog/type-2-ccs2-ac-dc-sarj-farklari",
    keywords: ["Type 2 şarj kablosu", "CCS2 nedir", "AC DC şarj farkı"]
  },
  {
    title: "Taşınabilir şarj cihazı mı wallbox mı?",
    description:
      "Seyahat esnekliği ile günlük sabit şarj güvenliği arasındaki farkları kullanım sıklığına göre karşılaştırın.",
    href: "/blog/tasinabilir-sarj-cihazi-mi-wallbox-mi",
    keywords: [
      "taşınabilir elektrikli araç şarj cihazı",
      "mobil şarj cihazı",
      "wallbox"
    ]
  },
  {
    title: "Site, iş yeri ve filo çözümleri",
    description:
      "RFID, OCPP, raporlama, kullanıcı yetkilendirme ve dinamik yük yönetimiyle çok kullanıcılı altyapıyı planlayın.",
    href: "/kurumsal-cozumler",
    keywords: [
      "site otoparkına şarj istasyonu",
      "iş yeri şarj istasyonu",
      "OCPP şarj cihazı",
      "RFID şarj istasyonu"
    ]
  },
  {
    title: "Dinamik yük yönetimi",
    description:
      "Şarj gücünü binanın anlık tüketimine göre yöneten sistemlerin pano kapasitesini ve büyümeyi nasıl desteklediğini öğrenin.",
    href: "/blog/dinamik-yuk-yonetimi-nedir",
    keywords: ["dinamik yük yönetimi", "load balancing", "akıllı şarj"]
  }
];

export const evGlossaryTerms: EvGlossaryTerm[] = [
  {
    name: "AC şarj",
    description:
      "Alternatif akımın aracın dahili şarj ünitesi tarafından bataryaya uygun doğru akıma çevrildiği şarj yöntemidir. Ev ve iş yeri wallbox ürünleri çoğunlukla AC çalışır.",
    relatedHref: "/blog/type-2-ccs2-ac-dc-sarj-farklari"
  },
  {
    name: "DC hızlı şarj",
    description:
      "Enerjinin araçtaki dahili AC şarj ünitesini kullanmadan doğru akım olarak bataryaya iletildiği yüksek güçlü şarj yöntemidir.",
    relatedHref: "/magaza?q=DC"
  },
  {
    name: "Wallbox",
    description:
      "Duvara veya kaideye sabitlenen, elektrikli aracı kontrollü ve korumalı biçimde şarj etmek için kullanılan kompakt AC şarj cihazıdır.",
    relatedHref: "/magaza"
  },
  {
    name: "Type 2",
    description:
      "Türkiye ve Avrupa'da AC şarj için yaygın kullanılan araç ve istasyon bağlantı standardıdır. Fiziksel uyum, aracın kabul ettiği gücü tek başına göstermez.",
    relatedHref: "/blog/type-2-ccs2-ac-dc-sarj-farklari"
  },
  {
    name: "CCS2",
    description:
      "Type 2 AC bağlantısına DC hızlı şarj pinleri ekleyen birleşik konnektör standardıdır. Hızlı şarj istasyonlarında yaygın kullanılır.",
    relatedHref: "/blog/type-2-ccs2-ac-dc-sarj-farklari"
  },
  {
    name: "kW",
    description:
      "Anlık güç birimidir. Şarj cihazının ve aracın belirli bir anda aktarabileceği enerji hızını ifade eder.",
    relatedHref: "/blog/11kw-ve-22kw-sarj-cihazi-farki"
  },
  {
    name: "kWh",
    description:
      "Enerji miktarı birimidir. Batarya kapasitesi ve şarj sırasında tüketilen elektrik bu birimle ifade edilir.",
    relatedHref: "/blog/elektrikli-arac-sarj-maliyeti-hesaplama"
  },
  {
    name: "Dahili şarj ünitesi",
    description:
      "Onboard charger olarak da bilinen, AC enerjiyi bataryaya uygun hale getiren araç içi bileşendir. AC şarjda ulaşılabilecek azami gücü sınırlar.",
    relatedHref: "/blog/11kw-ve-22kw-sarj-cihazi-farki"
  },
  {
    name: "Monofaze",
    description:
      "Tek fazlı elektrik beslemesidir. Ev tipi AC şarjda 7.4 kW sınıfı ürünler sık kullanılan seçenekler arasındadır.",
    relatedHref: "/blog/elektrikli-arac-sarj-cihazi-secim-rehberi"
  },
  {
    name: "Trifaze",
    description:
      "Üç fazlı elektrik beslemesidir. Uygun tesisat ve araç desteğiyle 11 kW veya 22 kW AC şarjı mümkün kılabilir.",
    relatedHref: "/blog/11kw-ve-22kw-sarj-cihazi-farki"
  },
  {
    name: "OCPP",
    description:
      "Şarj cihazı ile merkezi yönetim yazılımı arasında iletişim kuran açık protokoldür. Uzaktan izleme, yetkilendirme ve raporlama senaryolarında kullanılır.",
    relatedHref: "/kurumsal-cozumler"
  },
  {
    name: "RFID",
    description:
      "Kart veya anahtarlıkla kullanıcı tanımlama yöntemidir. Site, ofis ve filo şarj noktalarında erişim kontrolüne yardımcı olur.",
    relatedHref: "/kurumsal-cozumler"
  },
  {
    name: "Dinamik yük yönetimi",
    description:
      "Şarj gücünü binanın anlık elektrik tüketimine ve tanımlanan sınırlara göre ayarlayan kontrol yaklaşımıdır.",
    relatedHref: "/blog/dinamik-yuk-yonetimi-nedir"
  },
  {
    name: "IP koruma sınıfı",
    description:
      "Cihaz gövdesinin katı cisimlere ve suya karşı koruma seviyesini belirten sınıflandırmadır. Montaj alanıyla birlikte değerlendirilmelidir.",
    relatedHref: "/blog/elektrikli-arac-sarj-cihazi-secim-rehberi"
  }
];

export const installationLocations: InstallationLocation[] = [
  {
    slug: "sakarya",
    city: "Sakarya",
    districts: ["Serdivan", "Adapazarı", "Erenler", "Arifiye", "Sapanca", "Hendek"],
    title: "Sakarya Elektrikli Araç Şarj Cihazı Kurulumu",
    description:
      "Sakarya'da ev, villa, site, apartman ve iş yeri için elektrikli araç şarj cihazı keşfi, wallbox kurulumu ve devreye alma hizmeti.",
    introduction:
      "Sakarya'daki konut ve işletmeler için cihaz seçimini, pano kontrolünü, kablo güzergahını ve koruma ekipmanlarını tek kurulum planında ele alıyoruz.",
    localContext:
      "ParkChargeEV'in Serdivan'daki teknik merkezine yakın saha organizasyonu sayesinde Sakarya talepleri keşif uygunluğu, cihaz seçimi ve kurulum kapsamı birlikte değerlendirilerek planlanır.",
    process: [
      {
        title: "Araç ve kullanım analizi",
        description:
          "Aracın AC kabul gücü, günlük kilometre ve park süresi değerlendirilerek 7.4 kW, 11 kW veya 22 kW ihtiyacı belirlenir."
      },
      {
        title: "Elektrik altyapısı kontrolü",
        description:
          "Pano kapasitesi, monofaze veya trifaze yapı, hat mesafesi ve koruma elemanları keşifte kontrol edilir."
      },
      {
        title: "Kurulum ve devreye alma",
        description:
          "Onaylanan kapsam doğrultusunda montaj, bağlantı, güvenlik kontrolleri ve kullanıcı teslimi tamamlanır."
      }
    ],
    faqs: [
      {
        question: "Sakarya'da ücretsiz keşif yapılıyor mu?",
        answer:
          "Sakarya'daki uygun talepler için ücretsiz keşif planlanabilir. Kesin kapsam, lokasyon ve saha takvimi iletişim sonrasında teyit edilir."
      },
      {
        question: "Apartman otoparkına wallbox kurulabilir mi?",
        answer:
          "Teknik olarak uygun sahalarda kurulabilir. Ortak alan, enerji hattı, yönetim kararı ve gelecekte eklenecek kullanıcılar birlikte değerlendirilmelidir."
      }
    ]
  },
  {
    slug: "kocaeli",
    city: "Kocaeli",
    districts: ["İzmit", "Başiskele", "Kartepe", "Gebze", "Darıca", "Körfez"],
    title: "Kocaeli Elektrikli Araç Şarj Cihazı Kurulumu",
    description:
      "Kocaeli'de ev, site, ofis ve ticari otoparklar için elektrikli araç şarj cihazı keşfi, wallbox kurulumu ve teknik planlama hizmeti.",
    introduction:
      "Kocaeli'deki bireysel ve kurumsal projelerde cihaz gücü, araç uyumu, pano kapasitesi ve saha kullanım yoğunluğunu birlikte değerlendiriyoruz.",
    localContext:
      "Konut, sanayi ve iş yeri kullanımının birlikte yoğun olduğu Kocaeli projelerinde yalnızca bugünkü araç sayısını değil, yeni kullanıcı eklenmesini ve yük yönetimi ihtiyacını da planın parçası yapıyoruz.",
    process: [
      {
        title: "İhtiyaç ve kapasite analizi",
        description:
          "Konutlarda araç ve park süresi; iş yerlerinde kullanıcı sayısı, vardiya ve büyüme planı değerlendirilir."
      },
      {
        title: "Saha ve pano keşfi",
        description:
          "Kablo güzergahı, dağıtım panosu, koruma ekipmanları ve gerekiyorsa dinamik yük yönetimi ihtiyacı belirlenir."
      },
      {
        title: "Teklif, montaj ve teslim",
        description:
          "Cihaz ile kurulum kalemleri ayrıştırılmış teklif sunulur; onay sonrasında montaj, test ve kullanım teslimi yapılır."
      }
    ],
    faqs: [
      {
        question: "Kocaeli'de hangi ilçelere kurulum hizmeti veriliyor?",
        answer:
          "İzmit, Başiskele, Kartepe, Gebze, Darıca ve Körfez başta olmak üzere Kocaeli genelindeki talepler saha uygunluğu ve ekip takvimine göre değerlendirilir."
      },
      {
        question: "İş yeri için RFID veya OCPP gerekli mi?",
        answer:
          "Birden fazla kullanıcı, yetkilendirme veya tüketim raporu gereken projelerde RFID ve OCPP desteği anlamlıdır. Küçük tek kullanıcılı sahalarda her zaman zorunlu değildir."
      }
    ]
  }
];

export function getInstallationLocation(slug: string) {
  return installationLocations.find((location) => location.slug === slug);
}
