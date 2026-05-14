# Security Auth And Runtime Audit Prompt

```text
Bir application security reviewer gibi davran.

ParkChargeEV güvenlik, auth ve runtime yüzeyini denetle.

Kontrol başlıkları:
- admin auth ve login endpointi
- session üretimi, cookie ayarları ve session guard
- role/permission mantığı
- middleware ve admin noindex/no-store davranışı
- CSRF ve rate-limit yaklaşımı
- secret handling ve env management
- input validation
- file upload riski
- PayTR callback/webhook security
- loggingde hassas veri sızması
- runtime state persistence
- public API abuse riski

Canlı pentest yapmıyorsan bunu belirt ama kod ve mimari üzerinden ciddi riskleri bul.

Rapor formatı:
1. Kapsam
2. P0 Güvenlik Riskleri
3. Auth / Session Değerlendirmesi
4. Request Güvenliği
5. File / Webhook / External Input Riski
6. Secret ve Config Yönetimi
7. Runtime Dayanıklılık
8. Skor Kartı
9. Acil Düzeltmeler
```
