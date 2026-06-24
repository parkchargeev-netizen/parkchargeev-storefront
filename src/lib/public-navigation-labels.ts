type NavigationLabelInput = {
  href?: string;
  label: string;
};

const labelsByHref: Record<string, string> = {
  "/": "Anasayfa",
  "/hakkimizda": "Hakkımızda",
  "/kurumsal-cozumler": "Kurumsal Çözümler",
  "/urun-secici": "Ürün Seçici",
  "/karsilastir": "Karşılaştır",
  "/magaza": "Mağaza",
  "/blog": "Blog",
  "/iletisim": "İletişim",
  "/giris": "Giriş Yap",
  "/hesabim": "Hesabım",
  "/sepet": "Sepet",
  "/odeme": "Ödeme"
};

const labelsByPlainText: Record<string, string> = {
  "ana sayfa": "Anasayfa",
  hakkimizda: "Hakkımızda",
  "kurumsal cozumler": "Kurumsal Çözümler",
  "urun secici": "Ürün Seçici",
  karsilastir: "Karşılaştır",
  magaza: "Mağaza",
  blog: "Blog",
  iletisim: "İletişim",
  "giris yap": "Giriş Yap",
  hesabim: "Hesabım",
  sepet: "Sepet",
  odeme: "Ödeme",
  "musteri girisi": "Müşteri Girişi"
};

function normalizePlainText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function formatPublicNavigationLabel(item: NavigationLabelInput) {
  if (item.href && labelsByHref[item.href]) {
    return labelsByHref[item.href];
  }

  return labelsByPlainText[normalizePlainText(item.label)] ?? item.label;
}
