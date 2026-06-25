# PayTR Entegrasyon Notları

Son kontrol tarihi: 25 Haziran 2026

## Aktif Ödeme Modeli

ParkChargeEV müşteri ödeme akışı tek sayfa checkout olarak çalışır.

- Kanonik müşteri sayfası `/checkout` adresidir.
- Eski `/odeme` adresi geriye dönük uyumluluk için çalışır.
- Checkout sayfası `/api/checkout/create` endpoint'ini çağırır.
- Sunucu siparişi `pending_payment` olarak oluşturur ve sepeti yeniden fiyatlandırır.
- Sunucu PayTR iFrame API'den token alır.
- Tarayıcı sayfa değiştirmeden güvenli iframe alanını açar.
- Link API veya hosted ödeme sayfasına yönlendirme yapılmaz.
- Kart numarası, son kullanma tarihi ve CVV ParkChargeEV formunda toplanmaz, saklanmaz ve loglanmaz.

Kart alanlarını ParkChargeEV DOM'unda göstermek PayTR Direkt API onayı, ek güvenlik değerlendirmesi ve PCI kapsamı doğurur. Bu nedenle aktif müşteri akışı Direkt API kullanmaz.

## Endpointler

- `POST /api/checkout/create`: Sipariş oluşturur, PayTR iFrame tokenı üretir.
- `POST /api/checkout/callback`: `/api/paytr/callback` ile aynı doğrulama mantığına bağlıdır.
- `POST /api/paytr/token`: Eski endpoint; yeni checkout ile aynı token akışını çalıştırır.
- `POST /api/paytr/callback`: PayTR panelinde kullanılabilen mevcut bildirim URL'sidir.
- `POST /api/paytr/direct-form`: Varsayılan olarak `410 Gone` döndürür.

## iFrame API

Token isteği adresi:

- `https://www.paytr.com/odeme/api/get-token`

Zorunlu alanlar uygulamada sunucu tarafında üretilir:

- `merchant_id`
- `user_ip`
- `merchant_oid`
- `email`
- `payment_amount`
- `user_basket`
- `user_name`
- `user_address`
- `user_phone`
- `merchant_ok_url`
- `merchant_fail_url`
- `timeout_limit`
- `currency`
- `test_mode`
- `no_installment`
- `max_installment`
- `paytr_token`

`payment_amount` kuruş cinsinden tam sayıdır. Örneğin `34,56 TL`, PayTR'ye `3456` olarak gönderilir.

`merchant_ok_url` ve `merchant_fail_url` yalnızca kullanıcıyı bilgilendiren dönüş sayfalarıdır. Sipariş bu sayfalarda başarılı veya başarısız olarak işaretlenmez.

## Callback Kuralları

PayTR paneli için önerilen bildirim URL:

- `https://parkchargeev.com/api/paytr/callback`

Alternatif uyumluluk URL'si:

- `https://parkchargeev.com/api/checkout/callback`

Callback için şu kurallar zorunludur:

- Endpoint oturum veya admin yetkisi istemez.
- Gelen `hash`, `merchant_oid + merchant_salt + status + total_amount` verisinin merchant key ile HMAC-SHA256 imzası kullanılarak doğrulanır.
- Başarılı callback'te `payment_amount` sipariş toplamı ile karşılaştırılır.
- Başarılı callback'te `currency` sipariş para birimiyle karşılaştırılır. `TL` ve `TRY` aynı para birimi olarak değerlendirilir.
- Aynı `merchant_oid` için tekrar gelen aynı sonuç idempotent şekilde yalnızca `OK` döndürür.
- Başarılı bir ödeme, sonradan gelen başarısız callback ile geriye çekilmez.
- Yanıt gövdesi yalnızca düz metin `OK` olur.

## Admin Durum Kontrolü

Admin panelindeki kontrol, PayTR durum sorgulama servisiyle başarılı ödeme arar.

- Başarılı ödeme bulunursa sipariş ve işlem ödeme doğrulandı durumuna geçirilir.
- Başarılı ödeme bulunamazsa mevcut sipariş ve işlem durumu değiştirilmez.
- Durum sorgusu bir callback değildir; sorgu hatası `callback_failed` olarak kaydedilmez.
- `callback_failed` yalnızca PayTR'den gerçekten gelen ve doğrulanmış başarısız ödeme bildirimi için kullanılır.

## Vercel Ortam Değişkenleri

Sunucu ortamında aşağıdaki değerler bulunmalıdır:

- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`
- `PAYTR_TEST_MODE`
- `PAYTR_DEBUG_ON`

Operasyon kuralları:

- Canlı ödemede `PAYTR_TEST_MODE=0`.
- Test kartlarıyla kontrollü test yapılırken ilgili deployment için `PAYTR_TEST_MODE=1`.
- `PAYTR_DEBUG_ON` testte `1`, canlıda `0` önerilir.
- `PAYTR_TEST_USER_IP` yalnızca lokal geliştirme veya sabit test IP ihtiyacı için kullanılmalıdır.
- Merchant key ve salt yalnızca server env olarak tutulmalı, `NEXT_PUBLIC_` önekiyle yayınlanmamalıdır.
- Ortam değişkeni değiştirildikten sonra yeni deployment oluşturulmalıdır.

## SEO, GEO ve AIEO

Ödeme, sepet, giriş, hesap ve admin sayfaları arama sonuçlarında yer almamalıdır.

- `/checkout` ve `/odeme` `noindex, nofollow` korunur.
- Ödeme ve hesap URL'leri sitemap'e eklenmez.
- Kuruluş, ürün, hizmet ve uzmanlık bilgileri indekslenebilir kurumsal sayfalardaki yapılandırılmış verilerde tutulur.
- Kart verisinin ParkChargeEV tarafından saklanmadığı alışveriş akışında açıkça belirtilir.

## Resmi Kaynaklar

- https://dev.paytr.com/iframe-api/iframe-api-1-adim
- https://dev.paytr.com/iframe-api/iframe-api-2-adim
- https://dev.paytr.com/durum-sorgu
- https://dev.paytr.com/direkt-api
