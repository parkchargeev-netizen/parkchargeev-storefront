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
  { icon: "truck", label: "81 ile gönderim" },
  { icon: "wrench", label: "Keşif ve kurulum" }
] as const satisfies ReadonlyArray<{ icon: HomeIconKey; label: string }>;

export const solutionRoutes = [
  {
    icon: "home",
    label: "Ev",
    title: "Günlük kullanıma uygun wallbox",
    body: "Araç, pano ve otopark koşullarına göre 7.4 veya 11 kW çözümü netleştirin.",
    href: "/magaza?segment=Ev",
    cta: "Ev ürünlerini incele",
    accent: "7.4 / 11 kW"
  },
  {
    icon: "building",
    label: "Site",
    title: "Yönetime hazır ortak kullanım",
    body: "RFID, yük yönetimi ve maliyet paylaşımını keşif planıyla birlikte kurgulayın.",
    href: "/kurumsal-cozumler/site-ve-apartman",
    cta: "Site çözümünü planla",
    accent: "RFID"
  },
  {
    icon: "users",
    label: "İşletme",
    title: "Ölçeklenebilir şarj operasyonu",
    body: "Ofis, otel ve filo kullanımını raporlama ve servis modeliyle yönetin.",
    href: "/iletisim?reason=Kurumsal%20teklif",
    cta: "Kurumsal teklif al",
    accent: "OCPP"
  },
  {
    icon: "zap",
    label: "Ticari",
    title: "Yatırıma uygun saha modeli",
    body: "AC veya DC yatırımında kapasite, trafik ve geri dönüş senaryosunu değerlendirin.",
    href: "/iletisim?reason=ROI%20%C3%B6n%20fizibilite",
    cta: "Ön fizibilite al",
    accent: "ROI"
  },
  {
    icon: "cable",
    label: "Aksesuar",
    title: "Doğru kablo ve ekipman",
    body: "Type 2 uyumu, uzunluk ve stok kararını hızlıca tamamlayın.",
    href: "/magaza?category=Aksesuar",
    cta: "Aksesuarları gör",
    accent: "Type 2"
  }
] as const satisfies ReadonlyArray<{
  icon: HomeIconKey;
  label: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  accent: string;
}>;

export const decisionSteps = [
  {
    icon: "shopping",
    title: "Ürünü karşılaştır",
    body: "Güç, stok, bağlantı ve fiyat bilgisini aynı ekranda görün.",
    cta: "Mağaza",
    href: "/magaza"
  },
  {
    icon: "clipboard",
    title: "Uygunluğu doğrula",
    body: "Araç, faz ve otopark bilgileriyle doğru çözüm yolunu bulun.",
    cta: "Ürün seçici",
    href: "/urun-secici"
  },
  {
    icon: "building",
    title: "Projeyi planla",
    body: "Kurumsal ihtiyaçlarda saha, cihaz ve servis kapsamını netleştirin.",
    cta: "Teklif al",
    href: "/iletisim?reason=Kurumsal%20teklif"
  }
] as const satisfies ReadonlyArray<{
  icon: HomeIconKey;
  title: string;
  body: string;
  cta: string;
  href: string;
}>;

export const installationSteps = [
  {
    icon: "clipboard",
    step: "01",
    title: "İhtiyaç",
    body: "Araç, kullanım sıklığı ve otopark koşulları belirlenir."
  },
  {
    icon: "gauge",
    step: "02",
    title: "Teknik keşif",
    body: "Pano, faz, kablo hattı ve kapasite doğrulanır."
  },
  {
    icon: "wrench",
    step: "03",
    title: "Devreye alma",
    body: "Kurulum, test, teslim ve servis planı tamamlanır."
  }
] as const satisfies ReadonlyArray<{
  icon: HomeIconKey;
  step: string;
  title: string;
  body: string;
}>;

export const proofSignals = [
  { icon: "shield", label: "Güvenli ödeme ve açık fiyat" },
  { icon: "wrench", label: "Keşifle doğrulanan kurulum" },
  { icon: "spark", label: "Araç ve altyapı uyumu" }
] as const satisfies ReadonlyArray<{ icon: HomeIconKey; label: string }>;
