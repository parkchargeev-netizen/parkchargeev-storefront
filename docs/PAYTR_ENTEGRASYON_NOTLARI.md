# PayTR Entegrasyon Notları

Son kontrol tarihi: 18 Mayıs 2026

## Aktif Model

ParkChargeEV ödeme akışında iki yöntem desteklenir:

- `PayTR iFrame API`: Varsayılan ve düşük PCI kapsamlı akış.
- `PayTR Direkt API 3D Secure`: Kart formu sitede gösterilir, kart verisi ParkChargeEV API'sine gönderilmeden doğrudan PayTR'a POST edilir.

Direkt API yöntemi PayTR tarafında ayrıca yetki gerektirir. Yetki açık değilse mağaza panelinden PayTR destek ekibine başvurulmalıdır.

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

`merchant_ok_url` ve `merchant_fail_url` sadece kullanıcıyı bilgilendiren dönüş sayfalarıdır; sipariş onayı bu URL'lerde yapılmaz.

## Direkt API

POST hedefi:

- `https://www.paytr.com/odeme`

Sunucu yalnızca imzalı gizli alanları hazırlar. `cc_owner`, `card_number`, `expiry_month`, `expiry_year`, `cvv` alanları tarayıcıda oluşturulan form ile doğrudan PayTR'a gönderilir.

Aktif kurulum tek çekim ve 3D Secure çalışır:

- `installment_count=0`
- `card_type=""`
- `non_3d=0`

Taksitli satış açılacaksa PayTR'ın BIN sorgulama ve taksit oranları servisleri ayrıca kullanılmalıdır.

## Callback Kuralları

Bildirim URL:

- `/api/paytr/callback`

PayTR callback için şu kurallar zorunludur:

- Endpoint oturum veya admin yetkisi istemez.
- Gelen `hash`, `merchant_oid + merchant_salt + status + total_amount` formülüyle doğrulanır.
- Başarılı callback'te `payment_amount` sipariş toplamı ile karşılaştırılır.
- Başarılı callback'te `currency` sipariş para birimiyle karşılaştırılır. `TL` ve `TRY` aynı para birimi olarak değerlendirilir.
- Aynı `merchant_oid` için tekrar gelen aynı sonuç idempotent şekilde sadece `OK` döndürür.
- Başarılı bir ödeme sonradan gelen başarısız callback ile geriye çekilmez.
- Yanıt gövdesi yalnızca `OK` olur.

## Operasyon Notları

- PayTR panelinde Bildirim URL canlı domain için `https://parkchargeev.com/api/paytr/callback` olmalıdır.
- Canlı modda `PAYTR_TEST_MODE=0`, testte `PAYTR_TEST_MODE=1` kullanılmalıdır.
- `PAYTR_DEBUG_ON` testte `1`, canlıda `0` önerilir.
- `PAYTR_TEST_USER_IP` yalnızca lokal geliştirme/test için gereklidir.
- `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` sadece server env olarak tutulmalıdır.

## Resmi Kaynaklar

- https://dev.paytr.com/iframe-api/iframe-api-1-adim
- https://dev.paytr.com/iframe-api/iframe-api-2-adim
- https://dev.paytr.com/direkt-api/direkt-api-1-adim
- https://dev.paytr.com/direkt-api/direkt-api-2-adim
- https://dev.paytr.com/direkt-api/bin-sorgulama-servisi
- https://dev.paytr.com/direkt-api/taksit-sorgulama
