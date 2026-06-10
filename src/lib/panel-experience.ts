export type PanelTone = "success" | "warning" | "danger" | "info" | "neutral";

export type PanelActionCard = {
  label: string;
  detail: string;
  signal: string;
  href: string;
  tone: PanelTone;
};

export const marketPanelInsights = [
  {
    label: "Siparis ve fulfillment netligi",
    detail:
      "E-ticaret panellerinde siparis durumu, odeme, stok ve kargo aksiyonu tek bakista gorunur olunca operasyon hizi artar.",
    source: "Shopify/modern e-ticaret panel deseni"
  },
  {
    label: "EV icin teknik guven",
    detail:
      "OCPP, akilli sarj, yuk dengeleme ve kurulum gereksinimi gibi sinyaller karar vericinin risk algisini dusurur.",
    source: "Open Charge Alliance OCPP ekosistemi"
  },
  {
    label: "Self servis takip",
    detail:
      "Musteri panelinde siparis, kesif, kurulum, adres ve destek akisi ayrilinca tekrar arama ve WhatsApp yogunlugu azalir.",
    source: "E-ticaret hesap merkezi UX deseni"
  }
] as const;

export const adminRevenuePlays: PanelActionCard[] = [
  {
    label: "Ev tipi AC alicisi",
    detail: "7.4/11 kW wallbox, arac uyumu ve Sakarya ucretsiz kesif talebi hizli kapanir.",
    signal: "Hizli teklif",
    href: "/admin/teklifler",
    tone: "success"
  },
  {
    label: "Site / apartman karari",
    detail: "RFID, adil kullanim, kablo hatti ve yonetim sunumu teknik raporla ilerler.",
    signal: "Yonetim paketi",
    href: "/admin/saha",
    tone: "info"
  },
  {
    label: "KOBI ve ofis otoparki",
    detail: "22 kW AC, misafir/filo deneyimi, fatura ve servis plani birlikte sunulur.",
    signal: "Kurumsal teklif",
    href: "/admin/teklifler",
    tone: "warning"
  },
  {
    label: "Ticari lokasyon yatirimcisi",
    detail: "DC veya coklu AC saha icin trafo, enerji kapasitesi ve ROI on fizibilitesi istenir.",
    signal: "Fizibilite",
    href: "/admin/saha",
    tone: "danger"
  }
];

export const adminOpsChecklist = [
  {
    label: "Siparis karşilama",
    detail: "Odeme, stok, fatura, kargo ve kurulum upsell notlarini tek sirada kontrol et.",
    href: "/admin/siparisler"
  },
  {
    label: "Kesif planlama",
    detail: "Ucretsiz kesif yalnizca Sakarya; kurulum Sakarya ve Kocaeli olacak sekilde etiketle.",
    href: "/admin/saha"
  },
  {
    label: "Icerik ve SEO",
    detail: "11 kW vs 22 kW, apartman kurulumu ve Type 2 uyum rehberlerini guncel tut.",
    href: "/admin/blog"
  },
  {
    label: "Guvenlik ve denetim",
    detail: "Admin oturumlari, audit loglari ve rol yetkilerini gunluk kontrol et.",
    href: "/admin/audit"
  }
] as const;

export const customerSelfServiceCards: PanelActionCard[] = [
  {
    label: "Dogru cihazi bul",
    detail: "Arac, kullanim alani, faz ve gunluk ihtiyaca gore en uygun wallbox secilir.",
    signal: "Urun secici",
    href: "/urun-secici",
    tone: "success"
  },
  {
    label: "Kesif uygunlugunu kontrol et",
    detail: "Sakarya icin ucretsiz kesif, Sakarya ve Kocaeli icin kurulum plani gorunur.",
    signal: "Sehir kapsami",
    href: "/iletisim?reason=Ucretsiz%20kesif%20talebi",
    tone: "info"
  },
  {
    label: "Siparis ve kargoyu izle",
    detail: "81 ile urun kargosu, odeme ve kargo bilgisi ayni hesap merkezinde takip edilir.",
    signal: "81 il kargo",
    href: "#siparisler",
    tone: "neutral"
  },
  {
    label: "Servis kaydi ac",
    detail: "Kurulum sonrasi garanti, bakim ve teknik destek talepleri tek panelde toplanir.",
    signal: "Destek",
    href: "#destek",
    tone: "warning"
  }
];

export const customerTrustTimeline = [
  {
    label: "1. Uygunluk",
    detail: "Arac, konnektor, guc ve kurulum alani netlesir."
  },
  {
    label: "2. Teklif / sepet",
    detail: "Urun, aksesuar ve kurulum ihtiyaci birlikte secilir."
  },
  {
    label: "3. Kargo / kesif",
    detail: "Urun 81 ile kargolanir; Sakarya kesif kaydi planlanir."
  },
  {
    label: "4. Kurulum / destek",
    detail: "Sakarya ve Kocaeli kurulumlari randevu ve servis notuyla takip edilir."
  }
] as const;
