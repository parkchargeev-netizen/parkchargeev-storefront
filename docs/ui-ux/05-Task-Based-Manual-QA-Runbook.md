# Task Based Manual QA Runbook

Bu runbook gerçek kullanıcı görevi gibi manuel test yapılması için ParkChargeEV akışlarına uyarlanmıştır.

## Test Kuralları

- Her görev için başlangıç noktası yazılır.
- Görev tamamlama süresi ölçülebiliyorsa not alınır.
- Kullanıcının durakladığı, geri döndüğü veya emin olamadığı yer yazılır.
- Console, network ve görsel taşma notları birlikte tutulur.
- Mobil smoke için 390px genişlik referans alınır.

## Görev 1: Doğru Ürünü Bul ve Sepete Ekle

Başlangıç: Ana sayfa

1. Mağaza veya ürün seçiciye git.
2. Kullanım tipine uygun ürünü bul.
3. Ürün detayını aç.
4. Kurulum/uyumluluk bilgisini kontrol et.
5. Sepete ekle.

Kontrol:
- [ ] Ürün kolay bulundu
- [ ] Ürün detayındaki fiyat, stok ve kurulum bilgisi anlaşılır
- [ ] Sepete ekleme feedback veriyor
- [ ] Sepete geçiş net

## Görev 2: Sepetten Ödemeye Git

- [ ] Sepette adet/fiyat/toplam bilgisi anlaşılır
- [ ] Checkout form alanları açık
- [ ] Hata durumunda kullanıcı neyi düzelteceğini görüyor
- [ ] PayTR adımına geçiş güven veriyor

## Görev 3: Teklif Talebi Oluştur

- [ ] Teklif CTA'sı ürün ve kurumsal sayfalardan bulunabilir
- [ ] Form alanları gereksiz uzun değil
- [ ] Gönderim sonrası başarı veya hata feedback'i var
- [ ] Admin teklif kuyruğunda kayıt izlenebilir

## Görev 4: Karşılaştırmadan Satın Alma Aksiyonuna Geç

- [ ] Karşılaştırma sayfası açılıyor
- [ ] Ürün farkları ve önerilen kullanım senaryoları anlaşılır
- [ ] Ürün detayına veya sepete geçiş net
- [ ] Mobilde karşılaştırma kartları taşmıyor

## Görev 5: Blog/SEO İçeriğinden Satış Aksiyonuna Geç

- [ ] Blog veya il landing sayfası organik arama niyetine cevap veriyor
- [ ] İlgili ürün, karşılaştırma veya teklif formuna geçiş var
- [ ] Breadcrumb ve metadata bağlamı doğru

## Görev 6: Admin Operasyon Aksiyonu Tamamla

Başlangıç: `/admin`

1. Giriş yap.
2. Gösterge panelinden bugünün aksiyonunu seç.
3. Sipariş, teklif veya saha kaydını aç.
4. Durum güncelle.
5. Listeye geri dön.

Kontrol:
- [ ] Dashboard hızlı açılıyor
- [ ] Admin link geçişleri beklenmedik yavaşlık hissi vermiyor
- [ ] Global arama doğru sonuç döndürüyor
- [ ] Durum güncelleme feedback veriyor

## Görev 7: Admin Site ve İstasyon Yönetimi

- [ ] Site yönetiminden menü veya sayfa düzenlenebiliyor
- [ ] Site yönetiminden sayfa silinebiliyor ve ilgili menü linki kırık kalmıyor
- [ ] Kaydedilen menü yayındaki header/footer akışına yansıyor
- [ ] Admin istasyon ekranından istasyon eklenip düzenlenebiliyor
- [ ] İstasyon kayıtları admin panelde aranıp güncellenebiliyor

## Görev 8: Mobile Smoke Test

- [ ] Ana sayfa CTA'ları taşmıyor
- [ ] Mağaza ve ürün detay kullanılabilir
- [ ] Sepet/ödeme formu taşmıyor
- [ ] Admin kritik aksiyonları küçük ekranda erişilebilir

## Test Sonu Notları

- En fazla sürtündüğüm 3 nokta:
- En belirsiz 3 alan:
- Çalışmadığından şüphelendiğim 3 alan:
- En güçlü 3 akış:
