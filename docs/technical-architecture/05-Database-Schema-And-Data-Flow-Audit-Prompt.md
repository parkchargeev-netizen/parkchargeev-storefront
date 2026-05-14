# Database Schema And Data Flow Audit Prompt

```text
Bir database architect ve data model reviewer gibi davran.

ParkChargeEV veri modelini denetle:
- `src/server/db/schema.ts`
- Drizzle migration dosyaları
- products, variants, orders, quote_requests, service_leads
- admin_users, admin_sessions, audit_logs
- stations, navigation_items, site_pages
- PayTR transaction modeli
- fallback store ve canlı DB ayrımı

Kontrol başlıkları:
- source of truth netliği
- entity ilişkileri
- nullable alan aşırımı
- enum ve status modellemesi
- index yapısı
- auditability
- soft delete / hard delete stratejisi
- migration mantığı
- operational data ile domain data karışımı
- analytics ve transactional data ayrımı

Sorular:
- veri modeli ürün mantığını doğru taşıyor mu
- sipariş/ödeme/teklif/saha akışı veri bütünlüğü açısından savunulabilir mi
- istasyon ve harita verisinin canonical ownership'i belli mi
- büyüdükçe sorgu ve raporlama zorlaşır mı
- entegrasyonlardan gelen veri modele zarar veriyor mu

Rapor formatı:
1. Kapsam
2. Veri Modeli Güçlü Tarafları
3. Veri Modeli Riskleri
4. Source Of Truth Değerlendirmesi
5. Index / Query / Scale Değerlendirmesi
6. Migration ve Veri Evrimi Riski
7. Skor Kartı
8. Önerilen Düzenlemeler
```
