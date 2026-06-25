export const evChargingArticles = [
  {
    id: "art_ev_charging_cost",
    slug: "elektrikli-arac-sarj-maliyeti-hesaplama",
    title: "Elektrikli Araç Şarj Maliyeti Nasıl Hesaplanır?",
    category: "Maliyet Rehberi",
    excerpt:
      "Evde elektrikli araç şarj maliyetini batarya kapasitesi, eklenecek enerji, şarj kaybı ve güncel elektrik birim fiyatıyla hesaplayın.",
    coverKicker: "Şarj Maliyeti",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    readingMinutes: 8,
    seoDescription:
      "Elektrikli araç şarj maliyeti hesaplama formülünü öğrenin. Evde şarj maliyeti, kWh tüketimi, şarj kaybı ve 100 km enerji giderini adım adım hesaplayın.",
    sections: [
      {
        heading: "Elektrikli araç şarj maliyeti için temel formül",
        paragraphs: [
          "Şarj maliyeti sabit bir rakam değildir. Elektrik tarifesi, bataryaya eklenecek enerji ve şarj sırasındaki kayıplar değiştikçe sonuç da değişir. Bu nedenle güncel birim fiyatı kendi faturanızdan veya tarife sağlayıcınızdan kontrol ederek formül kullanmak en doğru yöntemdir.",
          "Temel hesap şu şekildedir: şebekeden çekilen enerji (kWh) x elektrik birim fiyatı (TL/kWh). Şebekeden çekilen enerji, bataryaya eklenen enerjiden bir miktar daha yüksek olabilir."
        ],
        bullets: [
          "Bataryaya eklenecek enerji = batarya kapasitesi x eklenecek doluluk oranı",
          "Şebekeden çekilen enerji = bataryaya eklenecek enerji / şarj verimi",
          "Toplam maliyet = şebekeden çekilen enerji x güncel TL/kWh"
        ]
      },
      {
        heading: "Örnek hesap nasıl yapılır?",
        paragraphs: [
          "60 kWh bataryalı bir aracı yüzde 20 seviyesinden yüzde 80 seviyesine çıkarmak için bataryaya yaklaşık 36 kWh enerji eklenir. Şarj verimini örnek olarak yüzde 90 kabul edersek şebekeden yaklaşık 40 kWh çekilir.",
          "Bu örnekte toplam maliyeti bulmak için 40 kWh değerini kullandığınız zaman dilimindeki güncel elektrik birim fiyatıyla çarpın. Böylece tarife değişse bile hesap yöntemi geçerliliğini korur."
        ]
      },
      {
        heading: "100 kilometre başına elektrik maliyeti",
        paragraphs: [
          "Araçları karşılaştırırken tam dolum maliyeti yerine 100 kilometre başına tüketim daha açıklayıcıdır. Aracın ortalama tüketimi 18 kWh/100 km ise şarj kaybını da hesaba katarak şebekeden gereken enerji belirlenebilir.",
          "Sürüş hızı, hava sıcaklığı, klima kullanımı, lastik basıncı ve yol eğimi gerçek tüketimi değiştirir. Araç ekranındaki uzun dönem ortalamasını kullanmak katalog değerinden daha kişisel bir sonuç verir."
        ],
        bullets: [
          "Araç ekranındaki uzun dönem kWh/100 km değerini alın.",
          "Şarj kaybı için makul bir verim varsayımı ekleyin.",
          "Sonucu güncel elektrik birim fiyatıyla çarpın."
        ]
      },
      {
        heading: "Evde AC şarj ile DC hızlı şarj maliyeti neden farklıdır?",
        paragraphs: [
          "Evde AC şarjın fiyatlandırması elektrik aboneliğinizdeki tarifeye bağlıdır. Halka açık AC veya DC istasyonlarda ise operatörün kWh tarifesi, istasyon gücü ve ticari hizmet modeli geçerlidir.",
          "DC hızlı şarj zaman kazandırır; evde AC şarj ise araç uzun süre park halindeyken düzenli kullanım için daha uygun olabilir. Kararı yalnızca kWh fiyatına değil, zaman ve erişim ihtiyacına göre de verin."
        ]
      },
      {
        heading: "Cihaz gücü elektrik faturasını artırır mı?",
        paragraphs: [
          "7.4 kW, 11 kW veya 22 kW cihaz seçimi aynı miktarda enerjiyi bataryaya aktarıyorsa temel enerji tüketimini tek başına katlamaz. Güç seviyesi esas olarak enerjinin ne kadar sürede aktarıldığını etkiler.",
          "Bununla birlikte yüksek güç; abonelik kapasitesi, eşzamanlı bina yükü ve zaman dilimi açısından farklı sonuçlar doğurabilir. Dinamik yük yönetimi, şarj gücünü diğer tüketimlerle dengelemeye yardımcı olabilir."
        ]
      }
    ],
    faq: [
      {
        question: "Elektrikli araç evde kaç TL'ye şarj olur?",
        answer:
          "Tek bir sabit tutar yoktur. Bataryaya eklenecek kWh, şarj kaybı ve güncel elektrik birim fiyatı çarpılarak hesaplanmalıdır."
      },
      {
        question: "11 kW cihaz 7.4 kW cihazdan daha fazla elektrik harcar mı?",
        answer:
          "Aynı enerji bataryaya aktarılıyorsa temel tüketim benzerdir; fark çoğunlukla şarj süresidir. Tesisat, araç kapasitesi ve kayıplar sonucu etkileyebilir."
      }
    ]
  },
  {
    id: "art_connectors_ac_dc",
    slug: "type-2-ccs2-ac-dc-sarj-farklari",
    title: "Type 2, CCS2, AC ve DC Şarj Arasındaki Farklar",
    category: "Teknik Rehber",
    excerpt:
      "Type 2 ve CCS2 konnektörlerini, AC ve DC enerji aktarımından ayırarak ev tipi ve hızlı şarj kararını doğru verin.",
    coverKicker: "Bağlantı Standartları",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    readingMinutes: 7,
    seoDescription:
      "Type 2 şarj kablosu, CCS2 konnektörü ve AC DC şarj farkını öğrenin. Ev tipi wallbox ve DC hızlı şarj uyumluluğunu doğru değerlendirin.",
    sections: [
      {
        heading: "Konnektör tipi ile şarj yöntemini ayırın",
        paragraphs: [
          "Type 2 ve CCS2 fiziksel bağlantı standartlarıdır; AC ve DC ise enerjinin araca aktarılma biçimini anlatır. Bu kavramlar birlikte kullanıldığı için sıkça birbirine karıştırılır.",
          "Bir ürünün Type 2 olması onun kaç kW güç vereceğini tek başına göstermez. Aynı şekilde CCS2 bağlantısı da her araçta aynı DC şarj hızına ulaşılacağı anlamına gelmez."
        ]
      },
      {
        heading: "Type 2 nedir?",
        paragraphs: [
          "Type 2, Türkiye ve Avrupa'da AC şarj için yaygın kullanılan bağlantı standardıdır. Ev tipi wallbox, iş yeri şarj cihazı ve halka açık AC istasyonlarda görülebilir.",
          "Araç Type 2 bağlantıya sahip olsa bile 7.4 kW, 11 kW veya 22 kW seçeneklerinden hangisini kullanabileceği aracın dahili şarj ünitesi ve elektrik altyapısıyla sınırlıdır."
        ],
        bullets: [
          "Ev ve iş yeri AC şarjında yaygındır.",
          "Soketli veya sabit kablolu cihazlarda kullanılabilir.",
          "Fiziksel uyum, azami şarj gücünü tek başına belirlemez."
        ]
      },
      {
        heading: "CCS2 nedir?",
        paragraphs: [
          "CCS2, Type 2 bağlantı düzenine DC hızlı şarj için ek güç pinleri ekleyen birleşik sistemdir. Uyumlu araçlarda yüksek güçlü DC istasyonlara bağlantı sağlar.",
          "Gerçek hız; istasyonun verebildiği güç, aracın şarj eğrisi, batarya sıcaklığı ve doluluk oranı gibi değişkenlere bağlıdır."
        ]
      },
      {
        heading: "AC şarj nasıl çalışır?",
        paragraphs: [
          "AC şarjda şebekeden gelen alternatif akım, aracın içindeki dahili şarj ünitesi tarafından bataryanın kullanacağı doğru akıma dönüştürülür. Bu nedenle aracın onboard charger kapasitesi sınır belirleyicidir.",
          "Araç gece boyunca evde veya gün içinde iş yerinde park ediyorsa AC şarj çoğu kullanım senaryosu için dengeli bir çözümdür."
        ]
      },
      {
        heading: "DC hızlı şarj nasıl çalışır?",
        paragraphs: [
          "DC istasyonda dönüşüm cihazın içinde yapılır ve enerji bataryaya doğru akım olarak iletilir. Böylece araçtaki AC şarj ünitesinin güç sınırı aşılabilir.",
          "DC şarj özellikle rota üzeri, ticari saha ve kısa bekleme süresi gereken durumlarda değerlidir. Ev kurulumu için ise güç, maliyet ve altyapı gereksinimi nedeniyle genellikle AC wallbox tercih edilir."
        ]
      }
    ],
    faq: [
      {
        question: "Type 2 hızlı şarj mıdır?",
        answer:
          "Type 2 çoğunlukla AC bağlantı standardıdır. Şarjın hızlı olup olmadığı cihazın gücü ve aracın kabul kapasitesiyle belirlenir."
      },
      {
        question: "CCS2 olan her araç aynı hızda mı şarj olur?",
        answer:
          "Hayır. Aracın DC kabul gücü, şarj eğrisi, batarya sıcaklığı ve doluluk oranı gerçek hızı değiştirir."
      }
    ]
  },
  {
    id: "art_portable_vs_wallbox",
    slug: "tasinabilir-sarj-cihazi-mi-wallbox-mi",
    title: "Taşınabilir Şarj Cihazı mı, Sabit Wallbox mı?",
    category: "Karşılaştırma",
    excerpt:
      "Taşınabilir elektrikli araç şarj cihazı ile sabit wallbox seçeneklerini güvenlik, hız, kullanım sıklığı ve kurulum açısından karşılaştırın.",
    coverKicker: "Ürün Karşılaştırması",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    readingMinutes: 7,
    seoDescription:
      "Taşınabilir elektrikli araç şarj cihazı mı wallbox mı seçilmeli? Mobil şarj aleti ve sabit ev tipi cihazı güç, güvenlik ve kullanım açısından karşılaştırın.",
    sections: [
      {
        heading: "İki ürün aynı ihtiyacı farklı biçimde çözer",
        paragraphs: [
          "Taşınabilir şarj cihazları farklı lokasyonlarda kullanım esnekliği sağlar. Sabit wallbox ise düzenli park alanında özel hat, koruma ve kontrollü kullanım düzeni kurmayı kolaylaştırır.",
          "Seçim yaparken yalnızca cihaz fiyatına değil, ürünü ne sıklıkta ve hangi elektrik altyapısında kullanacağınıza bakın."
        ]
      },
      {
        heading: "Taşınabilir şarj cihazı ne zaman mantıklıdır?",
        paragraphs: [
          "Seyahat, ikinci konut veya yedek çözüm ihtiyacında taşınabilir cihaz pratik olabilir. Farklı priz ve akım koşullarına uygun adaptör, sıcaklık kontrolü ve akım sınırlama özellikleri önemlidir.",
          "Standart bir prizin uzun süreli yüksek akıma uygun olduğu varsayılmamalıdır. Priz, hat ve koruma ekipmanları elektrik uzmanı tarafından kontrol edilmelidir."
        ],
        bullets: [
          "Seyahat ve yedek kullanım",
          "Birden fazla lokasyonda düşük veya orta güç ihtiyacı",
          "Uygunluğu doğrulanmış priz ve elektrik hattı"
        ]
      },
      {
        heading: "Sabit wallbox ne zaman daha uygundur?",
        paragraphs: [
          "Araç her gün aynı park alanında şarj ediliyorsa sabit wallbox daha düzenli bir kullanıcı deneyimi sunar. Özel hat, doğru koruma ekipmanları ve cihazın duvara sabitlenmesi günlük kullanımı kolaylaştırır.",
          "Zamanlama, enerji takibi, RFID veya dinamik yük yönetimi gibi özellikler de sabit cihazlarda daha yaygın olabilir."
        ],
        bullets: [
          "Düzenli ev veya iş yeri şarjı",
          "7.4 kW, 11 kW veya 22 kW kontrollü güç",
          "Akıllı özellikler ve kalıcı kablo düzeni"
        ]
      },
      {
        heading: "Güvenlikte belirleyici olan yalnızca cihaz değildir",
        paragraphs: [
          "Her iki seçenekte de elektrik hattının sürekli yüke uygunluğu, kaçak akım koruması, sigorta seçimi, topraklama ve bağlantı noktası önemlidir.",
          "Taşınabilir ürünün adı, her prize koşulsuz bağlanabileceği anlamına gelmez. Sabit wallbox da doğru keşif ve kurulum olmadan tek başına güvenli sistem oluşturmaz."
        ]
      },
      {
        heading: "Kısa karar özeti",
        paragraphs: [
          "Günlük ana şarj çözümü için çoğu kullanıcı sabit wallbox ile daha düzenli bir sistem kurar. Taşınabilir cihaz ise yedek ve seyahat rolünde güçlüdür.",
          "En doğru sonuç, araç kapasitesi ve saha altyapısı doğrulandıktan sonra iki ürünün kullanım rolünü ayrı tanımlamaktır."
        ]
      }
    ],
    faq: [
      {
        question: "Taşınabilir şarj cihazı normal prize takılır mı?",
        answer:
          "Ürün uygun fişe sahip olsa bile prizin ve hattın uzun süreli yüke uygunluğu kontrol edilmelidir. Her priz EV şarjı için otomatik olarak uygun değildir."
      },
      {
        question: "Wallbox kurulumu için ayrı hat gerekir mi?",
        answer:
          "Çoğu sabit kurulumda panodan uygun kesitte özel hat ve gerekli koruma ekipmanları planlanır. Kesin kapsam keşifte belirlenir."
      }
    ]
  },
  {
    id: "art_dynamic_load_management",
    slug: "dinamik-yuk-yonetimi-nedir",
    title: "Elektrikli Araç Şarjında Dinamik Yük Yönetimi Nedir?",
    category: "Teknik Rehber",
    excerpt:
      "Dinamik yük yönetiminin şarj gücünü bina tüketimiyle nasıl dengelediğini ve ev, site, ofis projelerinde ne zaman gerekli olduğunu öğrenin.",
    coverKicker: "Akıllı Şarj",
    publishedAt: "2026-06-25",
    updatedAt: "2026-06-25",
    readingMinutes: 7,
    seoDescription:
      "Dinamik yük yönetimi ve load balancing nedir? Ev, site ve iş yeri şarj cihazlarında güç paylaşımı, pano kapasitesi ve çoklu cihaz yönetimini öğrenin.",
    sections: [
      {
        heading: "Dinamik yük yönetimi ne yapar?",
        paragraphs: [
          "Dinamik yük yönetimi, şarj cihazlarının çektiği gücü binanın anlık elektrik tüketimine göre ayarlar. Amaç, tanımlanan güç sınırını aşmadan araçlara mümkün olan uygun gücü dağıtmaktır.",
          "Fırın, klima, üretim ekipmanı veya asansör gibi diğer yükler arttığında şarj gücü azaltılabilir; bina tüketimi düştüğünde araçlara ayrılan güç yeniden yükseltilebilir."
        ]
      },
      {
        heading: "Evde ne zaman gerekir?",
        paragraphs: [
          "Abonelik gücü sınırlıysa veya evde yüksek güçlü cihazlar aynı anda çalışıyorsa dinamik dengeleme faydalı olabilir. Bu sistem, her projede zorunlu değildir.",
          "Önce pano kapasitesi, ana sigorta, faz dengesi ve aracın gerçek güç ihtiyacı değerlendirilmelidir. Gereksiz yere yüksek güçlü cihaz seçip yazılımla sınırlamak yerine doğru cihaz sınıfını seçmek daha verimli olabilir."
        ]
      },
      {
        heading: "Site ve iş yerinde neden önemlidir?",
        paragraphs: [
          "Birden fazla şarj cihazının bulunduğu sahalarda tüm cihazların aynı anda azami güçte çalışması altyapı yatırımını büyütebilir. Yük yönetimi, mevcut kapasiteyi kullanıcılar arasında kontrollü biçimde paylaştırır.",
          "Kullanıcı önceliği, araçların park süresi, filo vardiyası ve toplam saha limiti yazılım kurgusuna dahil edilebilir."
        ],
        bullets: [
          "Toplam saha gücünü sınırlar.",
          "Birden fazla cihaz arasında güç paylaşır.",
          "Yeni cihaz eklenmesini daha planlı hale getirir.",
          "Aşırı yük riskini azaltmaya yardımcı olur."
        ]
      },
      {
        heading: "Statik ve dinamik güç paylaşımı farkı",
        paragraphs: [
          "Statik paylaşımda şarj sistemine sabit bir toplam güç ayrılır. Dinamik yaklaşımda ise binanın diğer tüketimleri de ölçülerek şarja ayrılabilecek güç anlık olarak değişir.",
          "Projenin büyüklüğü, ölçüm altyapısı, cihaz uyumu ve yönetim yazılımı hangi yöntemin uygun olduğunu belirler."
        ]
      },
      {
        heading: "Satın almadan önce kontrol listesi",
        paragraphs: [
          "Yük yönetimi özelliğinin yalnızca pazarlama adıyla değil, sayaç veya enerji analizörü uyumu, cihazlar arası iletişim, kesinti davranışı ve servis desteğiyle birlikte doğrulanması gerekir."
        ],
        bullets: [
          "Cihaz ve sayaç uyumluluğu",
          "Tek faz ve üç faz ölçüm desteği",
          "Birden fazla cihaz için güç paylaşımı",
          "İnternet kesintisindeki çalışma davranışı",
          "Uzaktan izleme ve teknik destek kapsamı"
        ]
      }
    ],
    faq: [
      {
        question: "Dinamik yük yönetimi şarjı yavaşlatır mı?",
        answer:
          "Bina tüketimi yüksek olduğunda şarj gücünü geçici olarak azaltabilir. Tüketim düştüğünde uygun sistem gücü yeniden artırır."
      },
      {
        question: "Tek bir wallbox için gerekli midir?",
        answer:
          "Her zaman değil. Abonelik gücü, eşzamanlı tüketim ve cihaz gücü keşifte değerlendirilerek karar verilmelidir."
      }
    ]
  }
];
