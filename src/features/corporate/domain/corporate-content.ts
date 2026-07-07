export const corporateBenefits = [
  {
    icon: "gauge",
    title: "Kapasite mühendisliği",
    body: "Mevcut güç, eş zamanlı kullanım ve büyüme senaryosu aynı teknik model içinde değerlendirilir."
  },
  {
    icon: "clipboard",
    title: "Şeffaf proje kapsamı",
    body: "Cihaz, altyapı, kurulum, devreye alma ve servis kalemleri net sorumluluklarla ayrıştırılır."
  },
  {
    icon: "wrench",
    title: "Operasyon desteği",
    body: "Keşiften bakıma kadar izlenebilir süreç, teslim kriterleri ve destek planı görünür kalır."
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
    body: "Lokasyon, kullanıcı profili, araç sayısı ve işletim hedefi birlikte netleştirilir."
  },
  {
    title: "Teknik keşif",
    body: "Pano, trafo, hat, park düzeni ve haberleşme koşulları yerinde doğrulanır."
  },
  {
    title: "Çözüm tasarımı",
    body: "Cihaz, yük yönetimi, yetkilendirme ve servis modeli tek proje planında tekliflenir."
  },
  {
    title: "Devreye alma",
    body: "Kurulum, test, kullanıcı bilgilendirmesi ve sürdürülebilir destek planı tamamlanır."
  }
] as const;

export const corporateStandards = [
  "Yük yönetimi ve kapasite planı",
  "OCPP uyumlu operasyon seçenekleri",
  "RFID ve kullanıcı yetkilendirme",
  "Raporlama ve servis görünürlüğü"
] as const;
