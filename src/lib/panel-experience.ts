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
    label: "Sipariş ve fulfillment netligi",
    detail:
      "E-ticaret panellerinde sipariş durumu, ödeme, stok ve kargo aksiyonu tek bakista görünür olunca operasyon hızı artar.",
    source: "Shopify/modern e-ticaret panel deseni"
  },
  {
    label: "EV için teknik güven",
    detail:
      "OCPP, akıllı şarj, yük dengeleme ve kurulum gereksinimi gibi sinyaller karar veriçinin risk algisini dusurur.",
    source: "Open Charge Alliance OCPP ekosistemi"
  },
  {
    label: "Self servis takip",
    detail:
      "Müşteri panelinde sipariş, keşif, kurulum, adres ve destek akışı ayrılınca tekrar arama ve WhatsApp yoğunluğu azalır.",
    source: "E-ticaret hesap merkezi UX deseni"
  }
] as const;

export const adminRevenuePlays: PanelActionCard[] = [
  {
    label: "Ev tipi AC alıcısi",
    detail: "7.4/11 kW wallbox, araç uyumu ve Türkiye geneli keşif talebi hızlı kapanır.",
    signal: "Hızlı teklif",
    href: "/admin/teklifler",
    tone: "success"
  },
  {
    label: "Site / apartman karari",
    detail: "RFID, adil kullanım, kablo hattı ve yönetim sunumu teknik raporla ilerler.",
    signal: "Yönetim paketi",
    href: "/admin/saha",
    tone: "info"
  },
  {
    label: "KOBI ve ofis otoparki",
    detail: "22 kW AC, misafir/filo deneyimi, fatura ve servis planı birlikte sunulur.",
    signal: "Kurumsal teklif",
    href: "/admin/teklifler",
    tone: "warning"
  },
  {
    label: "Ticari lokasyon yatirimcisi",
    detail: "DC veya coklu AC saha için trafo, enerji kapasitesi ve ROI on fizibilitesi istenir.",
    signal: "Fizibilite",
    href: "/admin/saha",
    tone: "danger"
  }
];

export const adminOpsChecklist = [
  {
    label: "Sipariş karşılama",
    detail: "Ödeme, stok, fatura, kargo ve kurulum upsell notlarını tek sırada kontrol et.",
    href: "/admin/siparisler"
  },
  {
    label: "Keşif planlama",
    detail: "Türkiye genelinden gelen keşif ve kurulum taleplerini saha uygunluğuna göre etiketle.",
    href: "/admin/saha"
  },
  {
    label: "İçerik ve SEO",
    detail: "11 kW vs 22 kW, apartman kurulumu ve Type 2 uyum rehberlerini güncel tut.",
    href: "/admin/blog"
  },
  {
    label: "Güvenlik ve denetim",
    detail: "Admin oturumları, audit logları ve rol yetkilerini günlük kontrol et.",
    href: "/admin/audit"
  }
] as const;

export const customerSelfServiceCards: PanelActionCard[] = [
  {
    label: "Dogru cihazı bul",
    detail: "Araç, kullanım alanı, faz ve günlük ihtiyaca göre en uygun wallbox secilir.",
    signal: "Ürün secici",
    href: "/urun-secici",
    tone: "success"
  },
  {
    label: "Keşif uygunluğunu kontrol et",
    detail: "Türkiye'nin 81 ilinden keşif ve kurulum talebi oluşturun; uygunluğu ekip teyit etsin.",
    signal: "81 il talep",
    href: "/iletisim?reason=%C3%9Ccretsiz%20ke%C5%9Fif%20talebi",
    tone: "info"
  },
  {
    label: "Sipariş ve kargoyu izle",
    detail: "81 ile ürün kargosu, ödeme ve kargo bilgisi aynı hesap merkezinde takip edilir.",
    signal: "81 il kargo",
    href: "#siparisler",
    tone: "neutral"
  },
  {
    label: "Servis kaydı ac",
    detail: "Kurulum sonrası garanti, bakım ve teknik destek talepleri tek panelde toplanır.",
    signal: "Destek",
    href: "#destek",
    tone: "warning"
  }
];

export const customerTrustTimeline = [
  {
    label: "1. Uygünlük",
    detail: "Araç, konnektör, güç ve kurulum alanı netleşir."
  },
  {
    label: "2. Teklif / sepet",
    detail: "Ürün, aksesuar ve kurulum ihtiyacı birlikte secilir."
  },
  {
    label: "3. Kargo / keşif",
    detail: "Ürün 81 ile kargolanır; keşif talebi saha uygunluğuna göre planlanır."
  },
  {
    label: "4. Kurulum / destek",
    detail: "Kurulum talepleri randevu, saha uygunluğu ve servis notlarıyla takip edilir."
  }
] as const;
