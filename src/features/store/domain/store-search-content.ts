export const storeDecisionGuides = [
  {
    title: "Ev tipi şarj cihazı",
    body:
      "Monofaze altyapıda 7.4 kW, trifaze altyapıda 11 kW çoğu ev kullanıcısı için dengeli başlangıç seçenekleridir. Kararı aracın AC şarj kapasitesi ve günlük park süresiyle birlikte verin.",
    href: "/blog/elektrikli-arac-sarj-cihazi-secim-rehberi",
    cta: "Ev tipi seçim rehberi"
  },
  {
    title: "11 kW ve 22 kW karşılaştırması",
    body:
      "Daha yüksek cihaz gücü her araçta daha hızlı şarj anlamına gelmez. Aracın dahili AC şarj kapasitesi, tesisat ve kullanım süresi gerçek hızı belirler.",
    href: "/blog/11kw-ve-22kw-sarj-cihazi-farki",
    cta: "Güç farklarını karşılaştır"
  },
  {
    title: "Keşif ve kurulum",
    body:
      "Pano kapasitesi, faz yapısı, kablo güzergahı ve koruma ekipmanları ürün siparişinden önce değerlendirilmelidir. Böylece cihaz ve kurulum maliyeti birlikte netleşir.",
    href: "/hizmetler",
    cta: "Kurulum sürecini incele"
  }
] as const;

export const storeSearchFaqs = [
  {
    question: "Elektrikli araç şarj aleti ile şarj cihazı aynı ürün mü?",
    answer:
      "Evet. Günlük dilde elektrikli araç şarj aleti denilen ürünler teknik olarak elektrikli araç şarj cihazı, EV charger veya ev tipi kullanımda wallbox olarak adlandırılır. Ürün seçerken isimden çok güç, Type 2 uyumu, faz yapısı ve güvenlik özellikleri kontrol edilmelidir."
  },
  {
    question: "Ev tipi elektrikli araç şarj cihazı kaç kW olmalı?",
    answer:
      "Monofaze evlerde 7.4 kW, trifaze altyapıda 11 kW çoğu günlük kullanım için yeterlidir. 22 kW seçeneği ancak araç bu AC gücü destekliyorsa, tesisat uygunsa ve daha kısa şarj süresi gerçekten gerekiyorsa avantaj sağlar."
  },
  {
    question: "Elektrikli araç şarj cihazı fiyatını neler belirler?",
    answer:
      "Cihaz gücü, sabit kablo veya soket seçimi, RFID ve bağlantı özellikleri, koruma sınıfı, kablo uzunluğu ve kurulum ihtiyacı fiyatı etkiler. Toplam bütçede cihazın yanında pano, kablo hattı, koruma elemanları ve işçilik de değerlendirilmelidir."
  },
  {
    question: "Şarj cihazı satın almadan önce keşif gerekir mi?",
    answer:
      "Sabit wallbox ve yüksek güçlü cihazlarda teknik keşif önerilir. Keşifte elektrik panosu, faz sayısı, mevcut güç, kablo mesafesi, montaj alanı ve kaçak akım koruması kontrol edilerek güvenli kurulum kapsamı belirlenir."
  }
] as const;

