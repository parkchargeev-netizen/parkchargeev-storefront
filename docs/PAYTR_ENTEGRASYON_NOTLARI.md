# PayTR Entegrasyon Notları

Hazırlanma tarihi: 21 Nisan 2026

## 1. Entegrasyon Modeli

ParkChargeEV için uygun model:

- `PayTR iFrame API`

Bu modelde kart formu doğrudan PayTR tarafından servis edilir. Böylece ödeme bilgilerinin PCI yükü ParkChargeEV uygulamasının dışında tutulur.

## 2. PayTR Akışı

### Adım 1

Sunucu tarafında `iframe_token` alınır.

PayTR dokümanına göre istek adresi:

- `https://www.paytr.com/odeme/api/get-token`

Temel alanlar:

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

### Adım 2

Ödeme sonucu için callback URL kurulur.

Callback sonrası beklenen alanlar:

- `merchant_oid`
- `status`
- `total_amount`
- `hash`
- `payment_type`
- `currency`
- `payment_amount`
- başarısız işlemlerde `failed_reason_code`
- başarısız işlemlerde `failed_reason_msg`

## 3. En Kritik Kural

`merchant_ok_url` ve `merchant_fail_url` siparişi onaylayan sayfalar değildir.

Siparişi gerçekten onaylayacak tek yer:

- `callback URL`

Bu nedenle ParkChargeEV’de sipariş durumu sadece callback doğrulamasından sonra değişmelidir.

## 4. Hash Doğrulama

PayTR örneklerine göre callback hash doğrulama formülü:

```txt
base64_encode(
  HMAC_SHA256(
    merchant_oid + merchant_salt + status + total_amount,
    merchant_key
  )
)
```

Eğer gelen `hash` ile hesaplanan değer uyuşmuyorsa istek reddedilmelidir.

## 5. ParkChargeEV İçin Uygulama Kuralları

- Her sipariş için benzersiz `merchant_oid` üret
- Callback endpoint’ini session bağımsız tasarla
- Aynı sipariş için tekrar gelen callback’lerde idempotent davran
- Sipariş verisini ödeme öncesi veri tabanına `pending` olarak yaz
- Callback `success` gelirse `paid` durumuna geçir
- Callback `failed` gelirse gerekirse `failed` veya `cancelled` durumuna geçir
- Callback’e yalnızca `OK` döndür
- Callback öncesi kullanıcıya görünen başarı sayfasını nihai doğrulama sayma

## 6. Önerilen Sipariş Durum Akışı

- `draft`
- `pending_payment`
- `payment_processing`
- `paid`
- `failed`
- `cancelled`
- `fulfilled`

## 7. Güvenlik ve Operasyon

- `merchant_key` ve `merchant_salt` sadece sunucuda tutulmalı
- callback logları saklanmalı
- ödeme, sipariş ve muhasebe tutarları kuruş bazında tutulmalı
- `payment_amount` ile `total_amount` farkı taksit veya vade farkı gibi durumlar için ayrıca kaydedilmeli
- test ve canlı mod ayrımı environment üzerinden yapılmalı

## 8. Kaynaklar

- https://dev.paytr.com/iframe-api
- https://dev.paytr.com/iframe-api/iframe-api-1-adim
- https://dev.paytr.com/iframe-api/iframe-api-2-adim

