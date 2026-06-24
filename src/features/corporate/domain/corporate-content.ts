export const corporateBenefits = [
  {
    icon: "gauge",
    title: "Kapasite mühendisliği",
    body: "Mevcut güç, eş zamanlı kullanım ve büyüme senaryosu birlikte modellenir."
  },
  {
    icon: "clipboard",
    title: "Şeffaf proje kapsamı",
    body: "Cihaz, altyapı, kurulum, devreye alma ve servis kalemleri ayrıştırılır."
  },
  {
    icon: "wrench",
    title: "Teknik yaşam döngüsü",
    body: "Keşiften bakıma kadar sorumluluklar ve teslim kriterleri görünür kalır."
  }
] as const;

export const corporateMetrics = [
  { value: "AC / DC", label: "Karma çözüm mimarisi" },
  { value: "OCPP", label: "Yönetilebilir altyapı" },
  { value: "RFID", label: "Kullanıcı yetkilendirme" },
  { value: "81 il", label: "Ürün ve proje erişimi" }
] as const;

export const corporateProjectSteps = [
  {
    title: "İhtiyaç analizi",
    body: "Lokasyon, kullanıcı profili, araç sayısı ve işletim hedefi belirlenir."
  },
  {
    title: "Teknik keşif",
    body: "Pano, trafo, hat, park düzeni ve haberleşme koşulları doğrulanır."
  },
  {
    title: "Çözüm tasarımı",
    body: "Cihaz, yük yönetimi, yetkilendirme ve servis modeli birlikte tekliflenir."
  },
  {
    title: "Devreye alma",
    body: "Kurulum, test, eğitim ve sürdürülebilir destek planı tamamlanır."
  }
] as const;

export const corporateStandards = [
  "Yük yönetimi ve kapasite planı",
  "OCPP uyumlu operasyon seçenekleri",
  "RFID ve kullanıcı yetkilendirme",
  "Raporlama ve servis görünürlüğü"
] as const;
