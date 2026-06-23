# ParkChargeEV 2026 Site Geneli Yeni Tasarim Blueprint

Tarih: 23 Haziran 2026

Kapsam: parkchargeev.com icin guncel pazar ve rakip arastirmasi, persona evrenleri, satis surecleri, site geneli bilgi mimarisi, ana sayfa, urun liste, urun detay, sepet, siparis, odeme, lead, SEO, DX ve olcumleme tasarimi.

Bu dosya mevcut `parkchargeev-2026-canli-pazar-persona-ux-satis-raporu.md` dosyasinin uzerine kurulur. O rapor stratejik karar defteridir; bu dosya ise yeni sade site tasariminin uygulama blueprint'idir.

## 1. Ana Karar

ParkChargeEV tek bir site icinde uc farkli satis davranisini ayni anda tasimalidir:

1. Hemen satin al: aksesuar, kablo, hazir wallbox.
2. Uygunlugu kontrol et: ev tipi AC cihaz, faz/pano/guc belirsizligi.
3. Kesif/teklif al: site, apartman, ofis, filo, ticari lokasyon.

Yeni tasarim ilkesi:

```text
1 ekran = 1 ana karar
1 bolum = en fazla 1 ana CTA + 1 destek CTA
1 kart = baslik + 1 kisa cumle + 1 sinyal
```

Bu nedenle yeni arayuz, uzun aciklama bloklari yerine kisa karar kartlari, filtre cipsleri, ikonlu guven sinyalleri, urun karsilastirma satirlari ve mobil sticky aksiyonlarla ilerlemelidir.

## 2. Kaynakli Pazar Bulgulari

### 2.1 Resmi pazar sinyalleri

| Kaynak | Gozlem | ParkChargeEV karari |
|---|---|---|
| EPDK resmi istatistik sayfasi | Enerji Donusumu altinda `Sarj Hizmeti Piyasasi Istatistikleri` listeleniyor ve 2026 icin en guncel aylik rapor `Sarj Hizmeti Piyasasi Aylik Istatistikleri-Mayis 2026`. | Site pazar guvenini "regule, izlenen ve buyuyen kategori" olarak anlatmali; tarihli veri kullanildiginda ay/yil mutlaka yazilmali. |
| ODMD ana sayfa pazar kutusu | Ocak-Mayis kumulatif pazarda otomobil + hafif ticari toplam 453.138, otomobil 356.256, hafif ticari 96.882 olarak gorunuyor. | EV sarj talebi sadece EV satisi degil, otomotiv pazarinin genel yenilenme momentumu ile de desteklenir. Kampanya ve SEO takvimi aylik izlenmeli. |
| Mevcut ParkChargeEV raporu | EPDK Mayis 2026 verisi uzerinden toplam EV parki, AC/DC soket ayrimi ve il bazli talep sinyalleri analiz edildi. | Ana sayfada 3 pazar sinyalinden fazlasi gosterilmemeli; derin veri raporda kalmali. |

Kaynaklar:

- https://www.epdk.gov.tr/Detay/Icerik/3-0-222-1040/enerji-donusumusarj-hizmeti-piyasasi--istatistik
- https://www.odmd.org.tr/

### 2.2 Rakip ve UX deseni bulgulari

| Rakip / referans | Gozlenen desen | ParkChargeEV icin ders |
|---|---|---|
| ZES | 81 il, 5151 soket, AC/DC/HPC filtreleri, arac bulucu, rota planlama, rezervasyon, Autocharge. | ParkChargeEV ag operatoru gibi konumlanmamali; ancak "uyum, kapsama, hizli yardim" sinyallerini e-ticaret ve kurulum tarafinda ayni netlikte vermeli. |
| Esarj | 2500+ soket, %75 DC soket, tum markalar, ev/is yeri ozel istasyon talebi, is ortakligi. | Bireysel satin alma, ozel istasyon talebi ve is ortakligi ayri CTA'lar olmalidir. |
| ChargePoint Home Flex | Ana sayfada "buy now", "installation", uyumluluk, guvenlik, garanti, yorum ve konfigurasyon secimi ayni urun hikayesinde. | Urun detay sayfasi ilk ekranda kime uygun, hangi guc, hangi kurulum, hangi garanti sorularini cevaplamali. |
| Genel pazaryerleri | Fiyat ve hiz guclu; teknik uygunluk ve kurulum rehberi zayif. | ParkChargeEV'in avantaji "hizli sepet + uzman uygunluk + kurulum guveni" kombinasyonudur. |

Kaynaklar:

- https://zes.net/
- https://esarj.com/
- https://www.chargepoint.com/drivers/home

## 3. Konumlandirma

Ana vaat:

> Dogru sarj cihazini sec, altyapini netlestir, guvenle satin al.

Kisa marka cumlesi:

> Urun, uygunluk, kesif ve odeme tek akista.

Kullanicinin zihnindeki itirazlar:

| Itiraz | Site cevabi |
|---|---|
| Aracima uyar mi? | Urun secici, arac/guc/soket cipsleri, PDP uyum bolumu. |
| Evimde veya sitede calisir mi? | Faz/pano/kullanim sorulari, kesif CTA, kurulum sureci. |
| Yanlis urun alirsam? | WhatsApp, uygunluk kontrolu, iade/garanti mikro metni. |
| Odeme guvenli mi? | PayTR guvenli odeme sinyali ve checkout guven alani. |
| Kurulumu kim yapacak? | Hizmet kapsam ayrimi: 81 il urun kargosu, saha kesif/kurulum kapsami. |

## 4. Persona Evrenleri

| Evren | Persona | Ana ihtiyac | En hizli satis yolu | Ana CTA |
|---|---|---|---|---|
| A | Ev kullanicisi | 7.4 / 11 kW wallbox | Hero -> urun secici -> PDP -> sepet | Uygunlugu Kontrol Et |
| B | Hizli aksesuar alicisi | Type 2 kablo / ekipman | Magaza -> filtre -> sepet -> PayTR | Hemen Satin Al |
| C | Site/apartman yoneticisi | Ortak otopark cozumleri | Kurumsal rota -> kesif formu -> teklif | Site Icin Kesif Planla |
| D | Ofis/KOBI | 22 kW AC + servis | Isletme landing -> teklif -> arama | Kurumsal Teklif Al |
| E | Filo/operasyon | RFID, raporlama, coklu arac | Filo sayfasi -> demo/teklif | Filo Icin Teklif Al |
| F | Ticari lokasyon | DC/AC yatirim fizibilitesi | ROI sayfasi -> on fizibilite | ROI On Fizibilite Al |
| G | Elektrikci/partner | Teknik dokuman, tedarik | Partner sayfasi -> basvuru | Partner Basvurusu |
| H | Arastirma asamasi | EV almadan once bilgi | Rehber -> secici -> lead | Sarj Uygunlugunu Test Et |

## 5. Site Geneli Bilgi Mimarisi

Yeni navigasyon yalin olmalidir:

| Nav | Hedef | Icerik |
|---|---|---|
| Magaza | Hizli satin alma | Kategoriler, guc filtreleri, stok/fiyat. |
| Urun Secici | Emin olmayan kullanici | 4 soru, 1 sonuc, 2 CTA. |
| Site & Apartman | Kurumsal kesif | Yonetim, RFID, maliyet paylasimi, form. |
| Isletme & Filo | Yuksek degerli lead | Ofis, filo, otopark, raporlama. |
| Kurulum | Guven ve servis | Surec, kapsam, kesif, SSS. |
| Rehberler | SEO ve egitim | Kisa cevap sayfalari, seciciye gecis. |

Header kurali:

- Masaustu: logo, 6 nav, arama, WhatsApp, sepet, Kesif Al.
- Mobil: logo, arama, sepet, menu; alt sticky CTA sadece kritik sayfalarda.
- Ust guven seridi: PayTR, 81 il kargo, kesif/kurulum, WhatsApp.

## 6. Ekran Blueprintleri

### 6.1 Ana sayfa

Amac: Kullanici 5 saniyede kendi rotasini secmeli.

| Bolum | Goster | Gizle / azalt |
|---|---|---|
| Hero | Net vaat, 2 CTA, gercek urun/kurulum gorseli, 3 guven cipi. | Uzun paragraf, coklu rozet, dekoratif kalabalik. |
| Rota secimi | Ev, Site, Isletme, Aksesuar, Emin Degilim kartlari. | 6'dan fazla rota karti. |
| Urun seridi | En cok satan 4 urun, fiyat, guc, stok, sepete gecis. | Uzun teknik aciklama. |
| Uygunluk | 4 soruluk seciciye giris. | Formu ana sayfada uzun gostermek. |
| Kurulum | 3 adim: Uygunluk, Kesif, Kurulum. | 5+ adimli surec. |
| Guven | PayTR, kargo, garanti, WhatsApp, kisa yorum. | Uzun referans metinleri. |

Ana sayfa ideal copy limiti:

- H1: 8-12 kelime.
- Hero body: 18-24 kelime.
- Kart body: 12-16 kelime.
- Bolum sayisi: 6 ana banttan fazla olmamali.

### 6.2 Urun liste / Magaza

Amac: Kategori ve guc secimi hizli olsun.

Gerekli UI:

- Ust segment cipsleri: Ev, Site, Isletme, Aksesuar.
- Guc cipsleri: 7.4 kW, 11 kW, 22 kW, DC.
- Mobilde sticky filtre butonu.
- Urun kartinda yalnizca: gorsel, isim, guc, kullanim alani, fiyat, stok, ana CTA.
- Kart icinde 1 mini guven satiri: PayTR / kargo / uyum.

Olcum:

- `pce_product_filter_apply`
- `pce_store_quick_segment_click`
- `pce_add_to_cart`

### 6.3 Urun detay

Amac: Kullanici yanlis urun alma korkusunu asmali.

Ilk ekran:

- Sol: urun gorseli.
- Sag: isim, fiyat, stok, guc, kullanim alani, 2 CTA.
- CTA 1: Sepete Ekle.
- CTA 2: Uygunlugu Sor / WhatsApp.

Kisa bilgi bloklari:

| Blok | Maksimum icerik |
|---|---|
| Kime uygun? | 3 cips |
| Altyapi | 3 satir |
| Kutudan ne cikar? | 4 madde |
| Kurulum | 3 adim |
| SSS | 5 soru |

Mobil kural:

- Fiyat ve sepete ekle sticky kalmali.
- Teknik detaylar accordion olmali.
- WhatsApp ikincil ama gorunur olmali.

### 6.4 Sepet

Amac: Sepetten odemeye tek net adim.

Goster:

- Urunler, miktar, kablo/opsiyon, ara toplam, KDV, toplam.
- "Eksik olabilir" alaninda yalnizca ilgili aksesuar onerisi.
- PayTR, kargo, destek guven satiri.
- Mobil sticky toplam + Odeme CTA.

Gizle:

- Uzun kampanya metinleri.
- Sepet icinde gereksiz form.

### 6.5 Siparis / Checkout

Amac: PayTR oncesi kullanici guvenle tamamlasin.

Yapi:

1. Iletisim.
2. Teslimat.
3. Kart dogrulama / PayTR.

Kurallar:

- Tek sayfa, net ilerleme.
- Zorunlu alanlar belirgin.
- Hata metinleri alanin hemen altinda.
- PayTR ile kart bilgisinin guvenli islendigi kisa anlatilmali.
- Basarili/basarisiz donus sayfasi destek yolunu acik tutmali.

Olcum:

- `pce_checkout_start`
- `pce_checkout_validation_error`
- `pce_checkout_paytr_submit`
- `pce_paytr_return_success`
- `pce_paytr_return_failed`
- `pce_checkout_abandon_intent`

### 6.6 Iletisim / Teklif

Amac: Farkli lead tipleri ayni formda kaybolmasin.

Form reason'a gore degismeli:

| Reason | Ek alanlar |
|---|---|
| Ev kesfi | Il, ilce, arac, pano/faz bilgisi. |
| Site/apartman | Daire sayisi, otopark tipi, mevcut talep. |
| Isletme | Lokasyon tipi, arac sayisi, kullanim hedefi. |
| Filo | Arac sayisi, vardiya/kullanim, raporlama ihtiyaci. |
| Ticari ROI | Lokasyon, trafo durumu, hedef cihaz tipi. |

## 7. UI Sistem Kurallari

### 7.1 Yalinlik kurallari

- Tek bolumde 3-5 karttan fazla kart kullanma.
- Kart basligi 6 kelimeyi gecmesin.
- Kart metni 1 cumle olsun.
- Uzun aciklama gerekiyorsa accordion veya rehber sayfasina tasin.
- Her sayfada 1 ana CTA, 1 destek CTA, 1 iletisim yolu olsun.
- Guven sinyalleri ikonlu chip olarak kullanilsin.
- Kritik bilgiler tablo/cip olarak verilsin, paragraf olarak degil.

### 7.2 Gorsel dil

- Ana gorseller gercek urun, wallbox, kablo, otopark veya kurulum baglamindan gelmeli.
- Soyut gradient veya dekoratif orblar ana mesajin yerine gecmemeli.
- 3D/animasyon kullanilacaksa urun ve sarj akisini anlatmali.
- Urun kartlari temiz, is odakli ve taranabilir olmali.

### 7.3 Bilesen seti

| Bilesen | Kullanildigi yer | Rol |
|---|---|---|
| ScenarioCard | Ana sayfa, kategori girisi | Personayi rotaya sokar. |
| TrustChip | Header, checkout, PDP | Itiraz azaltir. |
| FitSelector | Ana sayfa, urun secici, PDP | Uygunluk korkusunu azaltir. |
| BuyBox | PDP | Satin alma kararini toplar. |
| StickyActionBar | Mobil PDP, sepet | Kaybi azaltir. |
| QuotePanel | Kurumsal sayfalar | Lead toplar. |
| CompareRow | PLP/PDP | Guc ve kullanim farkini sade anlatir. |
| StatusPanel | Odeme donusu | Kullaniciya net sonuc verir. |

## 8. Heuristik Kontrol

| Heuristik | ParkChargeEV uygulamasi |
|---|---|
| Durum gorunurlugu | Sepet, checkout ve PayTR donuslerinde status paneli. |
| Gercek dunya dili | kW, faz, pano, RFID gibi terimler kisa aciklama ile. |
| Kullanici kontrolu | Sepette miktar, opsiyon, geri donus ve destek yolu. |
| Tutarlilik | CTA isimleri ayni kalir: Sepete Ekle, Uygunlugu Kontrol Et, Kesif Al. |
| Hata onleme | Urun secici, stok/fiyat netligi, checkout validasyon. |
| Tanima onceligi | Filtre cipsleri ve segment kartlari, serbest metin aramaya destek olur. |
| Esneklik | Hemen al / kesif al / WhatsApp yollarinin bir arada bulunmasi. |
| Minimal tasarim | Her ekran tek ana karara hizmet eder. |
| Hata kurtarma | PayTR fail donusu ve checkout hata metinleri destek yoluyla bitmeli. |
| Yardim | SSS, WhatsApp, kurulum rehberi, teknik dokuman. |

## 9. Deney Evrenleri ve Test Plani

| Test | Varyant A | Varyant B | Ana metrik |
|---|---|---|---|
| Hero CTA | Magazayi Incele | Uygunlugu Kontrol Et | Hero CTR, add-to-cart |
| Rota kartlari | 4 kart | 5 kart + Emin Degilim | Persona route CTR |
| PLP karti | Kompakt fiyat odakli | Uyum cipsli | PDP CTR |
| PDP buybox | Sepete Ekle ana | Uygunlugu Sor ana | Add-to-cart, WhatsApp click |
| Checkout | Tek kolon | Form + ozet split | Checkout validation error |
| Lead form | Genel form | Reason bazli form | Lead completion |

Kazanan parcalar ortak siteye geri beslenir. Testler ayni anda cok fazla degisken icermemelidir.

## 10. DX ve Olcumleme

Event sozlugu:

| Event | Nerede | Amac |
|---|---|---|
| `pce_hero_cta_click` | Ana sayfa | Ilk karar niyeti. |
| `pce_persona_route_click` | Rota kartlari | Persona evreni dagilimi. |
| `pce_seo_intent_click` | Rehber/intent cipsleri | SEO niyetinden satisa gecis. |
| `pce_selector_open` | Urun secici | Kararsiz kullanici girisi. |
| `pce_selector_result_click` | Secici sonucu | Oneriden urune gecis. |
| `pce_product_filter_apply` | Magaza | Filtre kullanimi. |
| `pce_add_to_cart` | PLP/PDP | Satin alma niyeti. |
| `pce_purchase_mode_select` | PDP | Hemen al / kesif / WhatsApp tercihi. |
| `pce_checkout_validation_error` | Checkout | Surtunme noktasi. |
| `pce_checkout_paytr_submit` | Checkout | PayTR'a gecis. |
| `pce_paytr_return_success` | Odeme donusu | Basarili donus. |
| `pce_paytr_return_failed` | Odeme donusu | Basarisiz donus. |
| `pce_whatsapp_click` | Header/PDP/Footer | Destek ihtiyaci. |
| `pce_installation_quote_click` | Kurulum/lead CTA | Kesif niyeti. |

DX gereksinimi:

- Event isimleri tek dosyada tutulmali.
- Event payload'lari `placement`, `persona`, `href`, `productId`, `totalKurus` gibi alanlarla okunabilir olmali.
- GA4 / dataLayer / Sentry / admin lead verileri ayni karar panosuna baglanmali.

## 11. Uygulama Fazlari

### Faz 0 - Mevcut durum sabitleme

- Canli sayfalar, PayTR, sepet ve checkout akisi korunur.
- Mevcut event sozlugu temizlenir.
- Mevcut uzun metinli bloklar isaretlenir.

### Faz 1 - Yalin site geneli tasarim

- Header sade nav'a cekilir.
- Ana sayfa 6 bant prensibine gore kurgulanir.
- Rota kartlari 4 ana persona + Emin Degilim seklinde duzenlenir.

### Faz 2 - Magaza ve urun detay

- PLP filtre cipsleri sade hale getirilir.
- PDP buybox ilk ekranda urun, guc, stok, fiyat ve iki CTA'yi toplar.
- Mobil sticky satin alma test edilir.

### Faz 3 - Sepet ve odeme

- Sepette gereksiz metin kaldirilir.
- Checkout hata eventleri dashboard'a baglanir.
- PayTR donus ve callback sureci go/no-go raporuyla izlenir.

### Faz 4 - Kurumsal ve lead motoru

- Site/apartman, isletme, filo ve ROI akislari ayrilir.
- Reason bazli form alanlari gelir.
- Admin tarafinda lead tipi ve oncelik skoru tutulur.

### Faz 5 - CRO dongusu

- Her hafta event raporu okunur.
- Dusuk performansli CTA/bolum azaltilir.
- Kazanan varyantlar ortak tasarima eklenir.

## 12. Kabul Kriterleri

Yeni tasarim basarili sayilmak icin:

- Ana sayfa ilk ekranda 2 saniye icinde marka vaadi ve ana CTA gorunmeli.
- Mobil PDP'de fiyat ve Sepete Ekle kaybolmamali.
- Checkout formu ilk hatada kullaniciyi alan bazinda yonlendirmeli.
- Her sayfada PayTR, kargo, destek veya kurulum sinyallerinden en az biri gorunmeli.
- Ana sayfada yazi yogunlugu mevcut rapor dilinden daha hafif olmali.
- Persona rotalari event olarak ayrismali.
- Site/apartman ve isletme kullanicisi magaza icinde kaybolmadan teklif akisi bulmali.

## 13. Hemen Uygulanacak Tasarim Backlog'u

| Oncelik | Is | Etki |
|---:|---|---|
| 1 | Ana sayfa strateji bandini 3 pazar sinyali + 5 rota karti olarak sadelestir. | Daha az yazi, daha hizli karar. |
| 2 | PDP buybox metinlerini ciplere ve accordion'a bol. | Mobil satin alma netligi. |
| 3 | PLP segment cipslerini sayfa ustunde kalici yap. | Hizli filtreleme. |
| 4 | Reason bazli iletisim formu alanlarini ekle. | Daha kaliteli lead. |
| 5 | GA4/dataLayer event dashboard dokumani olustur. | CRO dongusu baslar. |
| 6 | Blog/rehber sayfalarinda "cevap + urun/secici CTA" kalibi kur. | SEO'dan satisa gecis. |

## 14. Sonuc

ParkChargeEV'in yeni sitesi bir bilgi brosuru degil, karar azaltan satis sistemi olmalidir. En iyi tasarim, her personalari ayni ekranda uzun uzun anlatan tasarim degil; kullaniciyi ilk kararda dogru rotaya sokan, urunlerde teknik korkuyu azaltan, sepet/odeme yolunu kisa tutan ve her adimi olcen tasarimdir.

Nihai ortak site:

```text
Guven veren hero
+ persona rota secimi
+ hizli magaza
+ uygunluk secici
+ net urun detay
+ mobil sticky satin alma
+ sade sepet
+ PayTR guvenli checkout
+ reason bazli lead
+ event bazli CRO
```
