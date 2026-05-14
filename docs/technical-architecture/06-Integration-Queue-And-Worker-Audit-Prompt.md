# Integration Queue And Worker Audit Prompt

```text
Bir integration architect ve async systems reviewer gibi davran.

ParkChargeEV entegrasyonlarını ve asenkron dayanıklılığını denetle.

Kapsam:
- PayTR token ve callback akışı
- Supabase/Postgres bağlantısı
- Vercel serverless deployment modeli
- admin media upload
- sitemap/metadata/OG üretimi
- webhook handling
- queue/worker yokluğunun üretim riski
- retry ve idempotency stratejisi
- background task gözlemlenebilirliği
- external provider coupling

Özellikle bul:
- PayTR veya DB provider detaylarının domain içine sızdığı yerler
- webhook güvenlik eksikleri
- duplicate side-effect riski
- callback tekrarında idempotency boşluğu
- uzun süren işlerin request lifecycle içinde kalma riski
- queue/worker gerektirecek büyüme noktaları

Rapor formatı:
1. Kapsam
2. Integration Boundary Değerlendirmesi
3. Queue / Worker Riskleri
4. Webhook ve Async Akış Riskleri
5. Production Dayanıklılık Değerlendirmesi
6. Skor Kartı
7. En Öncelikli İyileştirmeler
```
