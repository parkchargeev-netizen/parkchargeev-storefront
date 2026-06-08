export type HomeIconKey =
  | "battery"
  | "building"
  | "cable"
  | "clipboard"
  | "gauge"
  | "home"
  | "message"
  | "plug"
  | "shield"
  | "shopping"
  | "spark"
  | "timer"
  | "truck"
  | "users"
  | "wrench"
  | "zap";

export const heroTrustSignals = [
  { icon: "shield", label: "PayTR güvenli ödeme" },
  { icon: "truck", label: "81 il ürün kargosu" },
  { icon: "wrench", label: "Keşif + kurulum planı" },
  { icon: "plug", label: "Araç uyumu kontrolü" }
] as const;

export const heroStats = [
  { value: "7.4 / 11 kW", label: "Evde gece şarjı" },
  { value: "22 kW", label: "Site ve ofis" },
  { value: "AC / DC", label: "Ticari lokasyon" }
] as const;

export const conversionRoutes = [
  {
    icon: "home",
    label: "Ev",
    title: "Her sabah hazır araç.",
    body: "Pano uygunluğu, araç uyumu ve 7.4/11 kW wallbox seçeneklerini hızlıca netleştirin.",
    href: "/magaza?segment=Ev",
    cta: "Ev için seç",
    accent: "7.4/11 kW"
  },
  {
    icon: "building",
    label: "Site",
    title: "Yönetime hazır çözüm.",
    body: "RFID, adil kullanım ve maliyet paylaşımı için yönetime sunulabilir teknik teklif alın.",
    href: "/kurumsal-cozumler/site-ve-apartman",
    cta: "Site çözümünü planla",
    accent: "RFID + yönetim"
  },
  {
    icon: "users",
    label: "İşletme",
    title: "Otoparkı marka değerine çevirin.",
    body: "Çalışan, misafir ve filo kullanımı için 22 kW AC, raporlama ve servis destekli kurulum.",
    href: "/iletisim?reason=Kurumsal%20teklif",
    cta: "İşletme teklifi al",
    accent: "OCPP"
  },
  {
    icon: "zap",
    label: "Ticari",
    title: "Şarjı gelir modeline bağlayın.",
    body: "DC hızlı şarj veya çoklu AC yatırımında saha, trafo ve geri dönüş riskini azaltın.",
    href: "/iletisim?reason=Ticari%20lokasyon%20teklifi",
    cta: "Fizibilite iste",
    accent: "Gelir modeli"
  },
  {
    icon: "cable",
    label: "Aksesuar",
    title: "Araca uygun kabloyu seçin.",
    body: "Type 2 kablo, soket uyumu ve kablo uzunluğunu stok ve fiyatla birlikte görün.",
    href: "/magaza?category=Aksesuar",
    cta: "Aksesuar seç",
    accent: "Type 2"
  }
] as const;

export const powerChoices = [
  {
    icon: "plug",
    power: "7.4 kW",
    title: "Monofaze ev",
    body: "Tek faz altyapılı evlerde ekonomik ve risksiz başlangıç seçeneği.",
    href: "/magaza?power=7.4%20kW"
  },
  {
    icon: "battery",
    power: "11 kW",
    title: "Trifaze ev / villa",
    body: "Günlük kullanım için hız, maliyet ve güven dengesini sağlar.",
    href: "/magaza?power=11%20kW"
  },
  {
    icon: "gauge",
    power: "22 kW",
    title: "Site / ofis",
    body: "Paylaşımlı otopark, RFID ve filo ihtiyacı olan alanlarda güçlü tercih.",
    href: "/magaza?power=22%20kW"
  },
  {
    icon: "zap",
    power: "DC",
    title: "Ticari lokasyon",
    body: "Otel, AVM, akaryakıt ve rota üstü lokasyonlarda yatırım modeli.",
    href: "/magaza?segment=Ticari"
  }
] as const;

export const installationSteps = [
  { icon: "clipboard", step: "01", title: "Uygunluk", body: "Araç, otopark ve kullanım ihtiyacı belirlenir." },
  { icon: "gauge", step: "02", title: "Keşif", body: "Pano, faz ve hat durumu netleşir." },
  { icon: "wrench", step: "03", title: "Kurulum", body: "Cihaz monte edilir, test edilir ve teslim edilir." },
  { icon: "timer", step: "04", title: "Destek", body: "Garanti, servis ve kullanım desteği devam eder." }
] as const;

export const proofSignals = [
  { icon: "shield", label: "PayTR güvenli ödeme" },
  { icon: "wrench", label: "Keşifle net kurulum" },
  { icon: "spark", label: "Araç ve kullanım uyumu" }
] as const;
