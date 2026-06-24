# ParkChargeEV 2026 Canli Pazar, Persona, UX, DX ve Satis Raporu

Tarih: 23 Haziran 2026

Kapsam: parkchargeev.com yeni site stratejisi, pazar ve rakip arastirmasi, persona evrenleri, satis surecleri, ana sayfa, magaza, urun detay, sepet, siparis, odeme, PayTR, admin operasyonu, olcumleme ve canliya alma hazirligi.

Bu rapor onceki calismalari unutmaz; `parkchargeev-pazar-persona-ux-satis-tasarim-raporu-2026.md`, `parkchargeev-2026-yeni-site-evrenleri-uiux-dx-raporu.md`, `PAYTR_ENTEGRASYON_NOTLARI.md` ve mevcut kod akislari uzerine kurulur. Bu dosya yeni karar defteri olarak kullanilmalidir.

## 1. Yonetici Ozeti

ParkChargeEV icin en guclu konumlandirma:

> EV sarj cihazini, altyapi uygunlugunu, kurulum kararini ve guvenli odemeyi tek akista netlestiren premium e-ticaret ve kesif platformu.

Pazar artik erken merakli kullanicidan daha genis ve daha karmasik bir satin alma evresine girmistir. Kullanici yalnizca "hangi urun ucuz?" sorusunu sormuyor; "aracima uyar mi?", "evde veya sitede calisir mi?", "kurulum gerekir mi?", "PayTR odemesi guvenli mi?", "yanlis alirsam kime sorarim?" sorularina da hizli cevap istiyor.

Kazanan deneyim formulu:

```text
Guncel pazar guveni
  + persona bazli rota
  + hizli magaza
  + uygunluk rehberi
  + net urun detay
  + sepet/siparis netligi
  + PayTR uyumlu odeme
  + canliya alma kontrol kapilari
  = daha az surtunme ve daha yuksek satis ihtimali
```

## 2. Guncel Pazar Sinyalleri

### 2.1 Resmi veri ozeti

23 Haziran 2026 itibariyla EPDK sayfasinda 2026 yilinin Ocak, Subat, Mart, Nisan ve Mayis aylik sarj hizmeti piyasasi raporlari listelenmektedir. En guncel listelenen aylik rapor `Sarj Hizmeti Piyasasi Aylik Istatistikleri-Mayis 2026` raporudur.

EPDK Mayis 2026 raporundan cikarilan ana sinyaller:

| Metrik | Mayis 2026 degeri | ParkChargeEV icin anlam |
|---|---:|---|
| Toplam elektrikli arac sayisi | 440.327 | Ev tipi wallbox, Type 2 kablo, site ve isletme sarj talepleri ana akima yaklasiyor. |
| Mayis 2026 aylik EA satis adedi | 13.458 | Her ay yeni arac sahipleri icin hizli karar ve kurulum rehberi ihtiyaci doguyor. |
| Toplam sarj noktasi sayisi | 44.175 | Pazar regule, izlenen ve guven beklentisi yuksek bir altyapi kategorisi. |
| AC sarj noktasi sayisi | 25.125 | Ev, site, ofis ve otopark AC cozumleri ParkChargeEV'in en dogal satis alani. |
| DC sarj noktasi sayisi | 19.050 | DC yatirim uzun karar surecli ama yuksek proje degerli bir lead segmenti. |

EPDK raporunda Istanbul, Ankara, Izmir, Bursa, Antalya, Balikesir, Kocaeli, Bolu, Konya ve Mugla Mayis 2026 elektrik tuketimi grafikleriyle one cikan iller arasindadir. ParkChargeEV'in Sakarya/Kocaeli/Marmara saha hizmeti dilini koruyup urun kargosunu Turkiye geneline net ayirmasi gerekir.

ODMD resmi rapor sayfasi 2026 Ocak-Mayis ve 2026 Mayis perakende satis raporlarini listeliyor. Bu, EV talebinin aylik kampanya, SEO ve urun talebi planlamasiyla izlenmesi gerektigini gosterir.

### 2.2 Talep yorumu

Pazar buyudukce kullanici profili daha heterojen hale gelir:

- Yeni EV sahibi hizli karar ister ama teknik yanlis yapmaktan korkar.
- Site yoneticisi bireysel urun degil, yonetilebilir altyapi ve kurul karari ister.
- Isletme ve filo karar vericisi urun + raporlama + servis sorumlulugu ister.
- Aksesuar alicisi hizli e-ticaret refleksiyle hareket eder.
- Yatirimci ROI, saha uygunlugu ve lisans/operasyon riskini gormek ister.

Bu nedenle tek bir ana sayfa mesaji herkes icin yeterli degildir. Ana sayfa ilk ekranda guven vermeli, hemen sonra kullaniciyi kendi satin alma evrenine sokmalidir.

## 3. Rakip Arastirmasi

### 3.1 Sarj agi operatorleri

| Rakip | One cikan mesaj | UX deseni | ParkChargeEV icin ders |
|---|---|---|---|
| ZES | 81 il, 5151 soket, AC/DC/HPC filtreleri, arac bulucu, rota planlama, rezervasyon, Autocharge | Harita, uygulama, arac secici, is ortakligi formu | ParkChargeEV sarj agi gibi davranmamali; fakat "kapsama, uyum, hizli destek" sinyalini urun/kargo/kurulum tarafinda ayni netlikte vermeli. |
| Esarj | 2500+ soket, %75 DC soket, tum markalar, ev/is yeri istasyon talebi, is ortakligi | Guven, tecrube, ozel istasyon, yatirim modeli | Ev/is yeri talep formu ve is ortakligi ayri akislara bolunmeli. |
| Trugo, Voltrun, Wat, Astor, Tesla, Shell ve digerleri | EPDK Mayis 2026 raporunda tuketim ve soket paylarinda gorunur | Ag, hiz, lokasyon, marka guveni | Kamuya acik sarj aglari ParkChargeEV'in dogrudan e-ticaret rakibi degil; guven standardini belirleyen dolayli rakiplerdir. |

### 3.2 Cihaz ureticileri ve premium urun sayfalari

| Rakip tipi | Ornek | One cikan desen | ParkChargeEV karari |
|---|---|---|---|
| Premium cihaz ureticisi | Tesla Wall Connector | Guc, uyumluluk, kurulum, power management, ticari kullanim ve destek bilgileri sade katmanlarla anlatilir | Urun detay ilk ekrani "guc, soket, altyapi, kurulum, kime uygun" bilgisini saklamamali. |
| Akilli sarj cihazi markasi | Wallbox Pulsar Plus | Uygulama kontrolu, Wi-Fi/Bluetooth, enerji yonetimi, solar, planli sarj | ParkChargeEV urun anlatiminda "akilli ozellik ne ise yarar?" sorusunu sade cevaplamali. |

### 3.3 E-ticaret ve kurulum rakipleri

| Rakip modeli | Guclu yani | Zayif yani | ParkChargeEV firsati |
|---|---|---|---|
| Genel pazaryeri | Fiyat, yorum, hizli satin alma | Teknik uygunluk ve kurulum rehberi zayif | Hizli sepet + uzman uygunluk katmani. |
| Niche wallbox magazasi | Urun vitrini ve marka guveni | Site/apartman/isletme projeleri genelde ayrismiyor | E-ticaret ve proje lead akisini tek platformda birlestirme. |
| Kurulum/danismanlik firmasi | Saha guveni | Sepete eklenebilir urun satisi zayif | "Hemen al" ve "kesifle ilerle" seceneklerini ayni buybox icinde sunma. |

## 4. ParkChargeEV Konumlandirma

### 4.1 Ana vaat

> Dogru sarj cihazini, altyapi uygunlugunu ve guvenli satin alma yolunu birlikte netlestirin.

### 4.2 Ticari oncelik

| Oncelik | Segment | Neden |
|---:|---|---|
| 1 | Ev tipi AC wallbox alicisi | Talep hizli, sepet potansiyeli yuksek, uygunluk rehberiyle ikna edilebilir. |
| 2 | Type 2 kablo ve aksesuar alicisi | Dusuk danismanlik, hizli mobil e-ticaret, ayni gun karar. |
| 3 | Site/apartman yonetimi | Yavas karar ama yuksek sepet/proje degeri. |
| 4 | Ofis/KOBI/otopark | 22 kW AC, servis ve raporlama ihtiyaci ile karli segment. |
| 5 | Filo ve ticari lokasyon | Uzun satis dongusu, yuksek teklif degeri. |
| 6 | Elektrikci/partner | Dolayli satis ve saha kapasitesi. |

### 4.3 Ana fark

ParkChargeEV sadece urun satmaz; uc karar yolunu birlikte isletir:

- `Hemen satin al`: aksesuar, kablo, hazir urun.
- `Uygunlugu kontrol et`: ev tipi cihaz, faz/pano/guc belirsizligi.
- `Kesif/teklif al`: site, apartman, isletme, filo, DC yatirim.

## 5. Persona Seti

### Persona 1 - Murat, yeni EV sahibi ev kullanicisi

| Alan | Detay |
|---|---|
| Ihtiyac | Evde guvenli AC sarj, 7.4 kW / 11 kW karari |
| Kaygi | Pano uygun mu, trifaze gerekir mi, yanlis cihaz alir miyim? |
| Tetikleyici | Arac teslimi, istasyonda bekleme, her sabah dolu arac ihtiyaci |
| Giris sorgulari | ev tipi arac sarj cihazi, Togg ev sarj, 11 kW wallbox |
| Satin alma davranisi | Once guven ve uygunluk, sonra fiyat ve kurulum |
| En iyi CTA | Evime Uygun Cihazi Bul, Uygunlugu Kontrol Et, Sepete Ekle |
| Kritik ekran | Ana sayfa rota karti, urun secici, PDP buybox, WhatsApp |

### Persona 2 - Deniz, aksesuar ve hizli alisveris kullanicisi

| Alan | Detay |
|---|---|
| Ihtiyac | Type 2 kablo, adaptör, tasima cantasi |
| Kaygi | 5 m mi 7 m mi, aracimla uyumlu mu, kargo ne zaman gelir? |
| Tetikleyici | Arac teslimi veya eksik kablo ihtiyaci |
| Giris sorgulari | Type 2 sarj kablosu, Togg sarj kablosu, Tesla Type 2 |
| Satin alma davranisi | Hizli filtre, stok, fiyat, kargo ve yorum/guven sinyali |
| En iyi CTA | Hemen Satin Al, Aracimla Uyumlu mu? |
| Kritik ekran | Magaza, urun karti, mobil sepet, kisa checkout |

### Persona 3 - Selin, site/apartman karar vericisi

| Alan | Detay |
|---|---|
| Ihtiyac | Ortak otoparkta adil, guvenli, olceklenebilir sarj altyapisi |
| Kaygi | Sakin itirazi, yangin guvenligi, maliyet paylasimi, trafo/pano |
| Tetikleyici | Site sakinlerinden gelen EV sarj talebi |
| Giris sorgulari | apartmanda sarj cihazi kurulumu, site otopark sarj |
| Satin alma davranisi | Tek urun degil; yonetim kuruluna sunulabilir teklif ister |
| En iyi CTA | Site Icin Kesif Planla, Yonetim Teklifi Al |
| Kritik ekran | Kurumsal cozum sayfasi, teklif formu, teknik SSS |

### Persona 4 - Emre, KOBI/ofis otoparki yoneticisi

| Alan | Detay |
|---|---|
| Ihtiyac | Calisan, misafir veya filo icin 22 kW AC sarj |
| Kaygi | Bakim, ariza muhatabi, kullanici yetkilendirme |
| Tetikleyici | Kurumsal imaj ve calisan/misafir deneyimi |
| Giris sorgulari | is yeri sarj istasyonu, ofis otopark EV sarj |
| Satin alma davranisi | Kisa teknik ozet + teklif + servis guveni |
| En iyi CTA | Kurumsal Teklif Al, 22 kW Cozumleri Gor |
| Kritik ekran | Isletme landing, urun detay, teklif formu |

### Persona 5 - Ece, filo ve operasyon yoneticisi

| Alan | Detay |
|---|---|
| Ihtiyac | Coklu arac sarj planlama, RFID, raporlama, yetkilendirme |
| Kaygi | Arac sirasi, tuketim takibi, operasyon sorumlulugu |
| Tetikleyici | Filo elektrifikasyonu |
| Giris sorgulari | filo sarj cozumleri, RFID sarj istasyonu, OCPP |
| Satin alma davranisi | Demo/teklif/kesif ile ilerler |
| En iyi CTA | Filo Icin Teklif Al |
| Kritik ekran | Kurumsal cozum, teknik tablo, ROI/kullanim senaryosu |

### Persona 6 - Hakan, ticari lokasyon yatirimcisi

| Alan | Detay |
|---|---|
| Ihtiyac | DC hizli sarj veya coklu AC yatirim fizibilitesi |
| Kaygi | Trafo, lisans, ROI, operasyon karmaşıkligi |
| Tetikleyici | Lokasyon trafigini artirma, gelir modeli kurma |
| Giris sorgulari | DC sarj istasyonu maliyeti, sarj istasyonu yatirim |
| Satin alma davranisi | Dogrudan satin alma yerine on fizibilite ister |
| En iyi CTA | ROI On Fizibilite Al, Saha Kesfi Planla |
| Kritik ekran | ROI formu, yatirim rehberi, kesif akisi |

### Persona 7 - Ahmet, elektrikci/kurulum partneri

| Alan | Detay |
|---|---|
| Ihtiyac | Teknik dokuman, montaj standardi, urun tedariki |
| Kaygi | Garanti disi montaj, yanlis urun, marj |
| Tetikleyici | Musterisine teklif hazirlama |
| Giris sorgulari | wallbox montaj semasi, EV sarj cihazi teknik dokuman |
| Satin alma davranisi | Teknik PDF, partner basvurusu, hizli tedarik |
| En iyi CTA | Partner Basvurusu, Teknik Dokuman Indir |
| Kritik ekran | Partner landing, teknik merkez |

### Persona 8 - Ayse, arastirma asamasindaki EV adayi

| Alan | Detay |
|---|---|
| Ihtiyac | EV almadan once evde sarj mumkun mu anlamak |
| Kaygi | Teknik terimler, maliyet belirsizligi |
| Tetikleyici | EV satin alma arastirmasi |
| Giris sorgulari | evde elektrikli arac sarj edilir mi, wallbox nedir |
| Satin alma davranisi | Once rehber okur, sonra seciciye gider |
| En iyi CTA | Sarj Uygunlugunu Test Et |
| Kritik ekran | Blog, SSS, urun secici |

## 6. Coklu Satin Alma Evrenleri

Bu evrenler tasarim varyantlarini test etmek icindir. Nihai site, her evrenin kazanan parcasini birlestirmelidir.

| Evren | Hedef persona | Ana psikoloji | UI deseni | Basari metrigi |
|---|---|---|---|---|
| A - Hizli e-ticaret | Deniz, Murat | Fiyat, stok, kargo, hiz | Magaza ilk ekraninda arama, kategori, kompakt kart | PLP -> PDP CTR, add-to-cart |
| B - Uzman rehber | Murat, Ayse | Yanlis urun alma korkusu | 4 soruluk urun secici | Selector completion, selector_result_click |
| C - Kurumsal teklif | Selin, Emre, Ece | Risk azaltma ve onay alma | Kesif/teklif landing + form | Lead completion |
| D - Premium guven | Tum personalar | Marka ve odeme guveni | Gercek urun/kurulum gorseli + trust bar | Hero CTR, bounce rate |
| E - Yerel servis + ulusal kargo | Marmara hizmet, Turkiye urun | Bana hizmet var mi? | Il bazli not, 81 il kargo ayrimi | Kargo satisi, kesif talebi |
| F - Teknik partner | Ahmet | Teknik dogruluk | Dokuman merkezi + partner basvuru | PDF indirme, basvuru |
| G - ROI/yatirim | Hakan | Geri donus ve operasyon riski | ROI on formu + fizibilite | Fizibilite talebi |
| H - Icerik/SEO/AIEO | Ayse ve arastirmacilar | Once ogren sonra karar ver | Soru-cevap blog + CTA | Blog -> selector/product |

## 7. Kazanan Ortak Site Mimarisi

### 7.1 Sitemap

```text
/
/magaza
/urun-secici
/urun/[slug]
/karsilastir
/sepet
/odeme
/kurumsal-cozumler
/kurumsal-cozumler/site-ve-apartman
/kurumsal-cozumler/is-yeri-ve-ofis
/kurumsal-cozumler/filo-ve-otopark
/hizmetler
/blog
/blog/[slug]
/iletisim
/giris
/hesabim
/admin
```

### 7.2 Navigasyon

Desktop:

```text
Top Trust Bar:
PayTR guvenli odeme | 81 il urun kargosu | Uzman destek | Kesif ve kurulum plani

Header:
Logo | Ev Tipi | Site & Apartman | Isletmeler | Magaza | Kurulum | Blog | Iletisim
CTA: Urun Secici | Kesif Al | Sepet
```

Mobil:

```text
Logo | Menu | Sepet
Sticky Bottom:
WhatsApp | Urun Secici | Sepet
```

## 8. Sayfa Bazli UX Kurgusu

### 8.1 Ana sayfa

Amaç: Ilk 10 saniyede guven, kategori ve rota karari vermek.

Ilk ekran:

- H1: "Araciniz, otoparkiniz ve altyapiniz icin dogru sarj cozumunu secin."
- Alt metin: "Ev, site ve isletmeler icin urun, uyumluluk, kargo ve kurulum kararini tek akista netlestirin."
- CTA 1: Magazayi Incele
- CTA 2: Uygunlugu Kontrol Et
- CTA 3: WhatsApp
- Trust: PayTR, 81 il kargo, uzman destek

Ana sayfa sirasi:

1. Hero + trust.
2. Uc ana rota: Ev, Site/Apartman, Isletme.
3. Akilli akis: urunu gor, uygunlugu netlestir, teklife gec.
4. One cikan urunler.
5. Kurulum sureci.
6. Guven ve rehberler.
7. Final CTA.

Mevcut kod durumu: `src/features/home` altındaki domain, application, infrastructure ve UI katmanları bu stratejinin ana iskeletini taşır.

### 8.2 Magaza / PLP

Amaç: Kullanici urunleri gormek icin hero gecmek zorunda kalmasin.

Ilk ekran:

- Arama.
- Kategori / guvence seridi.
- Acilir urun secici.
- One cikan urun rayi.
- Filtre ve siralama.
- Urun grid/list toggle.

Urun karti karar bilgileri:

- Gorsel veya cihaz preview.
- Badge / stok.
- Guc sinifi.
- Kurulum modu.
- Arac/connector uyumu.
- Fiyat.
- Incele CTA.

Mevcut kod durumu: `src/app/(site)/magaza/page.tsx` arama, filtre, acilir secici ve product grid yapisini tasiyor.

### 8.3 Urun detay / PDP

Amaç: Teknik karari ilk ekranda sade hale getirmek.

Desktop:

- Sol: galeri, teknik ozellikler, "kimler icin" karti.
- Sag sticky buybox: stok, urun adi, ozet, guc/kurulum/uyum cipleri, fiyat, varyant, sepete ekle.
- Alt: uygunluk kontrolu, SSS, ilgili urunler.

Mobil:

- Galeri.
- Urun adi + fiyat + 3 karar cipi.
- Tekil sticky satin alma bari.
- Teknik detaylar accordion.

Mevcut kod durumu: `src/app/(site)/urun/[slug]/page.tsx` buybox, uygunluk kontrolu, FAQ ve ilgili urunleri tasiyor. Sonraki iyilestirme mobil tekil sticky buy bar kontroludur.

### 8.4 Sepet

Amaç: Kullanici odeme oncesi toplam, kargo, kurulum ve destek kararini net gorsun.

Sepet davranislari:

- Urun satirinda varyant, uyum, kurulum bilgisi.
- Miktar degistirme ve kaldirma net.
- Kurulum gereken urunlerde "Kesif ekle" mikro CTA.
- Siparis ozeti sticky.
- 81 il kargo ve PayTR guveni gorunur.
- Uyelik zorunlu degil.

Mevcut kod durumu: `src/components/shop/cart-page-client.tsx` bu akisi buyuk olcude uyguluyor.

### 8.5 Siparis ve odeme

Amaç: Kart bilgisini guvenli PayTR akisi disinda tutmadan, kisa ve anlasilir checkout.

Akis:

1. Sepet dogrulama.
2. Iletisim.
3. Adres.
4. Onay kutusu.
5. PayTR kart dogrulama.
6. Siparis durum sorgusu.

Baymard'in checkout arastirmasinda uzun/karmasik checkout, guven eksikligi, ekstra maliyet ve toplam maliyeti gorememe sepet terk sebepleri arasindadir. ParkChargeEV checkout bu nedenle gereksiz alanlari azaltmali ve toplam/kargo/kurulum notunu odeme oncesi gostermelidir.

Mevcut kod durumu:

- `src/components/shop/checkout-page-client.tsx`: form, kart validasyonu, PayTR direct form post.
- `src/app/api/paytr/direct-form/route.ts`: server-side siparis ve PayTR payload hazirlama.
- `src/app/api/paytr/callback/route.ts`: hash, tutar, para birimi ve idempotency kontrolu.

## 9. Heuristik UX Matrisi

| Heuristik | ParkChargeEV uygulamasi |
|---|---|
| Sistem durumu gorunurlugu | Sepete eklendi, PayTR hazirlaniyor, PayTR donusu alindi, siparis durumu kontrol ediliyor mesajlari gorunmeli. |
| Gercek dunya dili | Trifaze, RFID, OCPP, DC, AC gibi terimler yaninda sade aciklama olmali. |
| Kullanici kontrolu | Filtre temizle, cevap degistir, sepetten kaldir, PayTR oncesi geri don. |
| Tutarlilik | Ev, site, isletme, aksesuar segmentleri ayni CTA ve ikon diliyle ilerlemeli. |
| Hata onleme | Form validasyonu, stok/tutar server-side hesaplama, PayTR oncesi adres ve telefon kontrolu. |
| Tanimaya dayali karar | Urun kartinda "Ev icin", "Kurulum gerekir", "Type 2" gibi cipler. |
| Esnek kullanim | Hizli satin al, secici, WhatsApp, kesif/teklif alternatifleri. |
| Minimalizm | Uzun teknik metin accordion/FAQ/rehbere tasinmali. |
| Hata kurtarma | "Unexpected JSON" yerine Turkce ve aksiyon odakli hata. |
| Yardim ve dokumantasyon | PDP uygunluk kontrolu, blog, teknik SSS, admin yardim metinleri. |

## 10. UI Tasarim Sistemi

### 10.1 Marka hissi

- Premium teknoloji.
- Guvenilir enerji altyapisi.
- Sade ama uzman.
- E-ticaret hizini bozmayan karar rehberi.
- Gercek urun ve kurulum gorselleri.

### 10.2 Renk ve bilesen kararlari

- Ana CTA: koyu yesil / primary.
- Guven ve basari: mint/emerald.
- Zemin: beyaz ve soft surface.
- Uyari/hata: kirmizi, alan altinda sade mesaj.
- Kart radius: 8-18 px arasi; ic ice karttan kacin.
- Butonlarda ikon kullan.
- Mobilde metin tasmasi olmamali, kartlar sabit oranli kalmali.

### 10.3 Motion

- Hero motion hafif olmali.
- Scroll animasyonu transform/opacity agirlikli.
- `prefers-reduced-motion` desteklenmeli.
- Mobilde WebGL/agir animasyon olmamali.

## 11. DX ve Frontend Mimarisi

### 11.1 Component katmanlari

```text
src/components/conversion
  trust-bar.tsx
  persona-route-card.tsx
  funnel-lane-card.tsx
  sticky-mobile-buy-bar.tsx

src/components/commerce
  product-grid.tsx
  product-card-compact.tsx
  product-filter-drawer.tsx
  product-sort-control.tsx
  cart-summary.tsx

src/components/decision
  product-selector.tsx
  compatibility-check.tsx
  power-comparison.tsx
  installation-need-card.tsx
  roi-calculator.tsx

src/components/content
  guide-card.tsx
  faq-accordion.tsx
  case-study-card.tsx
```

### 11.2 Mevcut event altyapisi

Kodda `src/lib/conversion-events.ts` ile su eventler destekleniyor:

- `pce_hero_cta_click`
- `pce_persona_route_click`
- `pce_product_filter_apply`
- `pce_selector_open`
- `pce_selector_result_click`
- `pce_store_quick_segment_click`
- `pce_seo_intent_click`
- `pce_add_to_cart`
- `pce_checkout_start`
- `pce_checkout_paytr_submit`
- `pce_purchase_mode_select`
- `pce_contact_submit`

Eksik olcum onerileri:

- `pce_checkout_validation_error`
- `pce_checkout_abandon_intent`
- `pce_paytr_callback_success`
- `pce_paytr_callback_failed`
- `pce_order_status_poll`
- `pce_whatsapp_click`
- `pce_installation_quote_click`

## 12. A/B Test Modeli

| Test | Hipotez | A | B | Basari metrigi |
|---|---|---|---|---|
| Hero mesaj | Cozum odakli H1 daha yuksek CTA alir | Urun odakli | Cozum + altyapi odakli | Hero CTR |
| Rota kartlari | 3 ana rota karar yorgunlugunu azaltir | 5 esit kart | 3 ana + 2 mini | Persona route CTR |
| Urun secici | 4 soru 6 sorudan daha yuksek tamamlanir | 6 soru | 4 soru | Selector completion |
| Magaza ilk ekran | Katalog odakli acilis PDP tiklamasini artirir | Buyuk hero | Arama + filtre + urun | PLP -> PDP CTR |
| PDP mobil | Sticky buy bar add-to-cart artirir | Normal CTA | Sticky fiyat + sepet | Add-to-cart |
| Checkout | Kisa form terk oranini azaltir | Uzun tek form | Kisa bolumlu form | Checkout completion |

## 13. SEO, GEO ve AIEO Plani

### 13.1 SEO kumeleri

| Kume | Sayfa / icerik |
|---|---|
| Ev tipi sarj | ev tipi arac sarj cihazi, wallbox, 7.4 kW, 11 kW |
| Arac uyumu | Togg sarj cihazi, Tesla wallbox, BYD Type 2 |
| Site/apartman | apartmanda sarj cihazi kurulumu, site otopark sarj |
| Isletme | ofis otopark sarj istasyonu, 22 kW AC |
| Aksesuar | Type 2 kablo, sarj kablosu 5m/7m |
| Yatirim | DC hizli sarj istasyonu maliyeti, sarj istasyonu yatirim |

### 13.2 AIEO / LLM discovery

- `/llms.txt` guncel tutulmali.
- Urun teknik ozellikleri tablo olarak verilmeli.
- SSS alanlari kullanici sorusuna dogrudan cevap vermeli.
- Kurulum ve PayTR odeme sureci adim adim aciklanmali.
- Kaynakli pazar verileri tarihleriyle yazilmali.

## 14. Canliya Alma Entegrasyon Stratejisi

Detayli runbook: `docs/canliya-alma-entegrasyonu.md`

Ana canliya alma kapilari:

1. Domain ve site URL:
   - `NEXT_PUBLIC_SITE_URL=https://parkchargeev.com`
   - canonical, sitemap, robots ve PayTR ok/fail URL'leri bu domaine gore dogrulanmali.
2. PayTR:
   - `PAYTR_TEST_MODE=0`
   - `PAYTR_DEBUG_ON=0`
   - Bildirim URL: `https://parkchargeev.com/api/paytr/callback`
   - Kart bilgisi ParkChargeEV sunucusuna POST edilmemeli; direct form PayTR `https://www.paytr.com/odeme` adresine gitmeli.
3. Veritabani:
   - Production `DATABASE_URL` dogrulanmali.
   - Drizzle migration ve seed/katalog verisi kontrol edilmeli.
4. Smoke:
   - `npm run verify:runtime`
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
   - kritik e2e: ana sayfa, magaza, urun detay, sepet, odeme.
5. Operasyon:
   - Admin login.
   - Urun stok/fiyat guncelleme.
   - PayTR callback loglari.
   - Siparis durum takibi.
   - Sentry/log izleme.

## 15. Faz Faz Uygulama Plani

### Faz 0 - Veri ve canliya alma hijyeni

- Pazar verisi ve kaynak tarihleri dokumante edildi.
- PayTR canli URL ve env listesi netlestirilecek.
- Runtime smoke zorunlu hale getirilecek.
- Turkce karakter ve encoding kontrolu yapilacak.

### Faz 1 - Ana sayfa ve mesaj sistemi

- Hero mesajlari A/B teste hazirlanacak.
- Rota kartlari metric tabanli izlenecek.
- Trust bar kisa tutulacak.

### Faz 2 - Magaza ve secici

- Mevcut acilir secici bagimsiz `/urun-secici` sayfasiyla ayni skor mantigina baglanacak.
- Mobil filtre eventleri eklenecek.
- Urun kartlari kategoriye gore kisa teknik ciplerle guclendirilecek.

### Faz 3 - Urun detay

- Mobil tek sticky buy bar kontrol edilecek.
- "Bu urun kimler icin?" alani daha gorunur hale getirilecek.
- SSS accordion ve schema tutarliligi test edilecek.

### Faz 4 - Sepet ve odeme

- Checkout terk eventleri eklenecek.
- PayTR basarili/basarisiz callback eventleri log/analytics katmanina baglanacak.
- Hata mesajlari son kullanici diliyle taranacak.

### Faz 5 - Admin ve icerik operasyonu

- Ana sayfa rota kartlari, secici metinleri ve CTA'lar CMS/admin tarafindan yonetilebilir hale getirilecek.
- Urun teknik ozellik yardim metinleri eklenecek.
- Kurumsal lead ve teklif durumlari raporlanacak.

### Faz 6 - SEO/GEO/AIEO

- Product, Breadcrumb, FAQ, Organization ve WebSite schema kontrolleri.
- llms.txt guncellemesi.
- EV marka/model uyum rehberleri.
- Site/apartman kurulum rehberleri.

## 16. Kabul Kriterleri

Yeni site tasarimi ve canliya alma planinin basarili sayilmasi icin:

- Ana sayfa ilk ekranda tek ana mesaj, uc rota ve net CTA sunar.
- Magaza ilk ekranda urun odakli acilir.
- Urun secici maksimum 4 karar sorusuyla sonuc uretir.
- PDP ilk ekranda guc, kurulum, uyum ve fiyat bilgisini verir.
- Sepet toplam maliyet, KDV, kargo ve kurulum notunu gosterir.
- Odeme akisi PayTR dokumantasyonuyla uyumludur.
- Callback hash, tutar, para birimi ve idempotency kontrolu yapar.
- `merchant_ok_url` ve `merchant_fail_url` yalnizca bilgilendirme icindir; siparis onayi callback ile olur.
- `PAYTR_TEST_MODE=0`, `PAYTR_DEBUG_ON=0`, production PayTR secrets ve production `NEXT_PUBLIC_SITE_URL` canli ortamda dogrudur.
- Turkce hata mesajlari teknik ham hatalari gizler.
- `npm run verify:runtime`, typecheck, lint ve build canliya alma oncesi temiz gecer.

## 17. Kaynaklar

Resmi ve pazar kaynaklari:

- EPDK Sarj Hizmeti Piyasasi Istatistikleri: https://www.epdk.gov.tr/Detay/Icerik/3-0-222/enerji-donusumusarj-hizmeti-piyasasi--istatistik
- EPDK Mayis 2026 raporu: https://www.epdk.gov.tr/Detay/DownloadDocument?id=4dQ8lBYrTmE=
- ODMD Perakende Satis Raporlari: https://www.odmd.org.tr/web_2837_1/neuralnetwork.aspx?type=36

Rakip ve sektor gozlemi:

- ZES: https://zes.net/
- Esarj: https://esarj.com/
- Tesla Wall Connector: https://www.tesla.com/tr_tr/support/charging/wall-connector
- Wallbox Pulsar Plus: https://wallbox.com/en_us/pulsar-plus-ev-charger

UX ve checkout:

- NN/g 10 Usability Heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- Baymard Cart Abandonment Stats: https://baymard.com/lists/cart-abandonment-rate

PayTR:

- PayTR iFrame API 1. Adim: https://dev.paytr.com/iframe-api/iframe-api-1-adim
- PayTR iFrame API 2. Adim: https://dev.paytr.com/iframe-api/iframe-api-2-adim
- PayTR Direkt API 1. Adim: https://dev.paytr.com/direkt-api/direkt-api-1-adim
