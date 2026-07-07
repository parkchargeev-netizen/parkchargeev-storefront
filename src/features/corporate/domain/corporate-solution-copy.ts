import type { SolutionModel } from "@/lib/mock-data";

const cleanSolutionCopyBySlug: Record<string, Partial<SolutionModel>> = {
  "site-ve-apartman": {
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
  "is-yeri-ve-ofis": {
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
  "filo-ve-otopark": {
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
};

export function withCleanCorporateSolutionCopy(solution: SolutionModel): SolutionModel {
  return {
    ...solution,
    ...(cleanSolutionCopyBySlug[solution.slug] ?? {})
  };
}
