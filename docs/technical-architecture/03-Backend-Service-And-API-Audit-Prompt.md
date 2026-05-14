# Backend Service And API Audit Prompt

```text
Bir senior backend reviewer gibi davran.

ParkChargeEV backend yüzeyini şu açılardan denetle:
- `src/app/api` route surface
- admin API route handler kalitesi
- public lead, cart, PayTR ve order endpointleri
- service/repository katmanı
- use-case ayrımı
- zod validation
- error handling ve response contract
- pagination/filtering
- auth ve role guard kullanımı
- idempotency ve side-effect riski
- transaction/data consistency
- observability

Özellikle kontrol et:
- büyük route dosyaları
- route içinde doğrudan SQL/domain logic birikimi
- tutarsız `{ ok, message }` response yapıları
- validation eksikleri
- admin endpointlerinde guard eksikleri
- webhook/callback tarafında signature ve replay riski
- async hata yutma ve sessiz failure

Rapor formatı:
1. Kapsam
2. P0 Backend Riskleri
3. API Surface Kalitesi
4. Service Layer Değerlendirmesi
5. Validation / Contract Değerlendirmesi
6. Error Handling / Runtime Riskleri
7. Skor Kartı
8. En Öncelikli Düzeltmeler

Skorlar:
- API tutarlılığı
- service katmanı sağlığı
- validation kapsamı
- runtime güveni
- maintainability
```
