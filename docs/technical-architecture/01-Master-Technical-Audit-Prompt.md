# Master Technical Audit Prompt

```text
Bir principal engineer, software architect, backend reviewer, frontend systems reviewer, database auditor ve release-readiness denetçisi gibi davran.

ParkChargeEV projesini bütünsel teknik denetimden geçir:
- Next.js App Router kod yapısı
- site, admin, api ve server modül sınırları
- backend route handler ve service katmanı
- frontend component mimarisi ve client/server component ayrımı
- Drizzle/PostgreSQL schema ve veri akışı
- Supabase/Postgres, PayTR, webhook ve admin entegrasyonları
- auth, session, role-based authorization ve middleware
- runtime config, secret handling ve güvenlik başlıkları
- performans, ölçeklenebilirlik, gözlemlenebilirlik
- test kalitesi, smoke test ve release readiness

Analiz ederken yalnızca "iyi/kötü" deme. Şu sorulara somut cevap ver:
- mimari açık ve savunulabilir mi
- modüller doğru sınırlarla ayrılmış mı
- route handlerlar controller/service ayrımını koruyor mu
- servisler tanrısal hale gelmiş mi
- API endpoint yüzeyi tutarlı mı
- frontend sürdürülebilir mi
- veri modeli ürün, sipariş, teklif, saha ve istasyon domainlerini doğru taşıyor mu
- PayTR ve external provider mantığı anti-corruption layer ile korunuyor mu
- auth, session, state ve runtime mantığı güvenli mi
- queue/worker yoksa serverless/webhook yükü için riskler neler
- test seviyesi refactor için yeterli mi
- sistem production için ne kadar hazır

Rapor formatı:
1. Kapsam
2. Kritik Bulgular
3. Mimari Değerlendirme
4. Backend Değerlendirme
5. Frontend Değerlendirme
6. Veritabanı ve Veri Akışı Değerlendirmesi
7. Entegrasyon ve Webhook Değerlendirmesi
8. Güvenlik ve Runtime Değerlendirmesi
9. Test ve Release Readiness
10. Skor Kartı
11. P0 / P1 / P2 kalan teknik işler
12. Yönetici Özeti

Skor kartı yüzdeleri:
- mimari netlik
- modülerlik
- backend olgunluğu
- frontend sürdürülebilirliği
- veritabanı kalitesi
- entegrasyon sınırları
- güvenlik
- performans hazırlığı
- test güveni
- production readiness

Somut ol, dosya/satır referansı ver, iyi alanları da yaz ve uzun vadeli teknik borç risklerini özellikle belirt.
```
