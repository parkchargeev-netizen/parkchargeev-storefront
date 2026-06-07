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
  | "users"
  | "wrench"
  | "zap";

export const heroTrustSignals = [
  { icon: "shield", label: "Güvenli ödeme" },
  { icon: "wrench", label: "Keşif + kurulum" },
  { icon: "plug", label: "Araç uyumu" },
  { icon: "message", label: "Hızlı destek" }
] as const;

export const heroStats = [
  { value: "11 kW", label: "Ev için denge" },
  { value: "22 kW", label: "Site / ofis" },
  { value: "DC", label: "Ticari yatırım" }
] as const;

export const conversionRoutes = [
  {
    icon: "home",
    label: "Ev",
    title: "Her sabah dolu batarya.",
    body: "7.4 / 11 kW wallbox ve güvenli konut kurulumu.",
    href: "/magaza?segment=Ev",
    cta: "Ev cihazları",
    accent: "11 kW"
  },
  {
    icon: "building",
    label: "Site",
    title: "Yönetime hazır çözüm.",
    body: "RFID, adil kullanım ve ölçeklenebilir otopark altyapısı.",
    href: "/kurumsal-cozumler/site-ve-apartman",
    cta: "Site çözümü",
    accent: "RFID"
  },
  {
    icon: "users",
    label: "İşletme",
    title: "Otoparkı marka değerine çevirin.",
    body: "22 kW AC, raporlama ve çalışan/misafir deneyimi.",
    href: "/iletisim?reason=Kurumsal%20teklif",
    cta: "Teklif al",
    accent: "OCPP"
  },
  {
    icon: "zap",
    label: "Ticari",
    title: "Şarjı gelir modeline bağlayın.",
    body: "DC hızlı şarj, saha fizibilitesi ve yatırım planı.",
    href: "/iletisim?reason=Ticari%20lokasyon%20teklifi",
    cta: "Saha planla",
    accent: "ROI"
  },
  {
    icon: "cable",
    label: "Aksesuar",
    title: "Araca uygun kabloyu seçin.",
    body: "Type 2 kablo ve günlük kullanım ekipmanları.",
    href: "/magaza?category=Aksesuar",
    cta: "Aksesuarlar",
    accent: "Type 2"
  }
] as const;

export const powerChoices = [
  {
    icon: "plug",
    power: "7.4 kW",
    title: "Monofaze ev",
    body: "İlk EV sahipleri ve gece şarjı için sade başlangıç.",
    href: "/magaza?power=7.4%20kW"
  },
  {
    icon: "battery",
    power: "11 kW",
    title: "Trifaze ev / villa",
    body: "Günlük kullanım için en dengeli AC tercih.",
    href: "/magaza?power=11%20kW"
  },
  {
    icon: "gauge",
    power: "22 kW",
    title: "Site / ofis",
    body: "Çoklu kullanıcı ve daha kısa park süresi için.",
    href: "/magaza?power=22%20kW"
  },
  {
    icon: "zap",
    power: "DC",
    title: "Ticari lokasyon",
    body: "Yüksek devirli saha yatırımı ve fizibilite.",
    href: "/magaza?segment=Ticari"
  }
] as const;

export const installationSteps = [
  { icon: "clipboard", step: "01", title: "Keşif", body: "Pano, faz ve hat kontrolü." },
  { icon: "gauge", step: "02", title: "Plan", body: "Güç, cihaz ve kablo seçimi." },
  { icon: "wrench", step: "03", title: "Montaj", body: "Güvenli kurulum ve test." },
  { icon: "timer", step: "04", title: "Destek", body: "Garanti ve servis takibi." }
] as const;

export const proofSignals = [
  { icon: "shield", label: "PayTR güvenli ödeme" },
  { icon: "wrench", label: "Kurulum sonrası destek" },
  { icon: "spark", label: "Premium marka deneyimi" }
] as const;
