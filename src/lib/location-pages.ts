export type LocationPageModel = {
  slug: string;
  city: string;
  region: string;
  heroMetric: string;
  demandSignal: string;
  summary: string;
  districts: string[];
  useCases: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

export const locationPages: LocationPageModel[] = [
  {
    slug: "istanbul",
    city: "İstanbul",
    region: "Marmara",
    heroMetric: "AVM, site ve filo",
    demandSignal: "Yoğun otopark kullanımı ve yüksek EV penetrasyonu",
    summary:
      "İstanbul'da elektrikli araç şarj istasyonu kurulumu için apartman, site, AVM, ofis ve filo otoparklarında keşif, cihaz seçimi, pano kontrolü ve devreye alma süreçlerini birlikte planlıyoruz.",
    districts: ["Kadıköy", "Ataşehir", "Beşiktaş", "Sarıyer", "Bakırköy", "Ümraniye"],
    useCases: ["Site otoparkı", "Ofis ve plaza", "AVM", "Filo şarj sahası"],
    faqs: [
      {
        question: "İstanbul'da apartman otoparkına şarj istasyonu kurulabilir mi?",
        answer:
          "Evet. Ortak alan izni, pano kapasitesi, kablo güzergahı ve sayaç modeli birlikte değerlendirilerek güvenli kurulum planı hazırlanır."
      },
      {
        question: "İstanbul projelerinde keşif ne kadar sürer?",
        answer:
          "Lokasyon yoğunluğuna göre değişmekle birlikte ön değerlendirme aynı gün, saha keşfi ise randevuya bağlı olarak kısa sürede planlanır."
      }
    ]
  },
  {
    slug: "ankara",
    city: "Ankara",
    region: "İç Anadolu",
    heroMetric: "Konut ve kamu sahaları",
    demandSignal: "Geniş otopark alanları ve kurumsal filo ihtiyacı",
    summary:
      "Ankara'da ev tipi, site tipi ve kurumsal EV şarj istasyonu projeleri için altyapı analizi, cihaz seçimi ve teknik servis sürecini tek akışta yönetiyoruz.",
    districts: ["Çankaya", "Yenimahalle", "Keçiören", "Etimesgut", "Gölbaşı", "Sincan"],
    useCases: ["Müstakil ev", "Site yönetimi", "Kamu otoparkı", "Filo merkezi"],
    faqs: [
      {
        question: "Ankara'da 22 kW cihaz için üç faz gerekir mi?",
        answer:
          "Genellikle 22 kW AC cihazlar üç faz altyapı ister. Keşif sırasında pano ve abonelik gücü kontrol edilmelidir."
      },
      {
        question: "Kurumsal otoparklarda kullanım takibi yapılabilir mi?",
        answer:
          "RFID, kullanıcı yetkilendirme ve raporlama desteği olan cihazlarla kullanım ve maliyet ayrımı yapılabilir."
      }
    ]
  },
  {
    slug: "izmir",
    city: "İzmir",
    region: "Ege",
    heroMetric: "Konut, marina ve turizm",
    demandSignal: "Turizm, yazlık ve ticari lokasyon dengesi",
    summary:
      "İzmir elektrikli araç şarj istasyonu kurulumlarında konut, yazlık, otel ve ticari otopark senaryoları için AC ve DC cihaz mimarisi tasarlıyoruz.",
    districts: ["Konak", "Karşıyaka", "Bornova", "Çeşme", "Urla", "Balçova"],
    useCases: ["Yazlık konut", "Otel", "Marina", "Açık otopark"],
    faqs: [
      {
        question: "İzmir'de yazlık için ev tipi şarj cihazı kurulabilir mi?",
        answer:
          "Evet. Monofaze veya üç faz altyapıya göre 7.4 kW, 11 kW veya 22 kW seçenekleri değerlendirilir."
      },
      {
        question: "Otel ve turizm tesislerinde hangi cihazlar uygundur?",
        answer:
          "Uzun süreli park alanlarında AC cihazlar, hızlı devir gereken noktalarda DC hızlı şarj seçenekleri değerlendirilebilir."
      }
    ]
  },
  {
    slug: "bursa",
    city: "Bursa",
    region: "Marmara",
    heroMetric: "Sanayi ve konut",
    demandSignal: "OSB, filo ve site projeleri",
    summary:
      "Bursa'da sanayi tesisleri, filo merkezleri ve konut otoparkları için elektrikli araç şarj cihazı seçimi, kurulum ve bakım süreçlerini planlıyoruz.",
    districts: ["Nilüfer", "Osmangazi", "Yıldırım", "Mudanya", "Gemlik", "İnegöl"],
    useCases: ["OSB", "Filo", "Site otoparkı", "Servis sahası"],
    faqs: [
      {
        question: "Bursa'da filo şarj kurulumu nasıl planlanır?",
        answer:
          "Araç sayısı, vardiya, park süresi ve trafo kapasitesi birlikte hesaplanarak AC/DC hibrit kurulum planı çıkarılır."
      },
      {
        question: "Sanayi tesislerinde yük yönetimi gerekir mi?",
        answer:
          "Birden fazla cihaz kullanılacaksa dinamik yük yönetimi ve enerji izleme altyapısı önerilir."
      }
    ]
  },
  {
    slug: "kocaeli",
    city: "Kocaeli",
    region: "Marmara",
    heroMetric: "Lojistik ve üretim",
    demandSignal: "Filo, depo ve iş yeri otoparkları",
    summary:
      "Kocaeli EV şarj projelerinde üretim tesisleri, lojistik sahalar ve ofis otoparkları için keşif, cihazlandırma ve servis desteği sunuyoruz.",
    districts: ["İzmit", "Gebze", "Darıca", "Kartepe", "Başiskele", "Çayırova"],
    useCases: ["Lojistik deposu", "Ofis otoparkı", "Filo merkezi", "Site projesi"],
    faqs: [
      {
        question: "Kocaeli'de iş yeri şarj istasyonu kurulumu için ne gerekir?",
        answer:
          "Pano kapasitesi, kablo hattı, park düzeni ve kullanıcı yetkilendirme ihtiyacı keşif sırasında belirlenir."
      },
      {
        question: "Filo araçları için hızlı şarj gerekir mi?",
        answer:
          "Araçların park süresi kısa ise DC hızlı şarj değerlendirilebilir; uzun park eden filolarda AC cihazlar daha ekonomik olabilir."
      }
    ]
  },
  {
    slug: "sakarya",
    city: "Sakarya",
    region: "Marmara",
    heroMetric: "Yerel operasyon",
    demandSignal: "Teknokent, konut ve sanayi odaklı talep",
    summary:
      "Sakarya'da ParkChargeEV ekibiyle ev, site, iş yeri ve filo şarj istasyonu projelerinde hızlı keşif, kurulum ve teknik destek akışı sağlıyoruz.",
    districts: ["Serdivan", "Adapazarı", "Erenler", "Arifiye", "Sapanca", "Hendek"],
    useCases: ["Ev tipi kurulum", "Site otoparkı", "İş yeri", "Sanayi tesisi"],
    faqs: [
      {
        question: "Sakarya'da keşif desteği alabilir miyim?",
        answer:
          "Evet. ParkChargeEV'in yerel operasyon avantajıyla keşif ve teknik değerlendirme hızlıca planlanabilir."
      },
      {
        question: "Sapanca ve çevresinde yazlık kurulum yapılır mı?",
        answer:
          "Uygun elektrik altyapısı ve güvenli montaj alanı bulunduğunda yazlık konutlarda ev tipi şarj cihazı kurulabilir."
      }
    ]
  }
];

export function getLocationPageBySlug(slug: string) {
  return locationPages.find((page) => page.slug === slug);
}
