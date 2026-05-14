# Frontend Architecture And State Audit Prompt

```text
Bir frontend architect ve state management reviewer gibi davran.

ParkChargeEV frontendini yalnızca UI olarak değil, mimari olarak denetle.

İncele:
- site/admin page organizasyonu
- server component ve client component sınırları
- cart provider ve local state kullanımı
- admin shell, route warmup ve command menu yapısı
- form state, validation ve submit akışları
- reusable component varlığı
- inline style aşırımı
- duplicate UI logic
- eski stitch HTML referansları ile üretim kodu ayrımı
- responsive kurallar

Sorular:
- frontend sürdürülebilir mi
- büyük client componentler var mı
- state dağınık mı
- event binding kırılgan mı
- bileşen dili koda yansımış mı
- yeni özellik eklemek giderek pahalı hale geliyor mu
- admin ve site frontend mimarisi aynı kalite seviyesinde mi

Rapor formatı:
1. Kapsam
2. Kritik Frontend Mimari Riskleri
3. State ve Event Binding Değerlendirmesi
4. Render / Server-Client Component Mimarisi
5. Componentization Durumu
6. Responsive / Maintainability Riski
7. Refactor Önerisi
8. Skor Kartı
```
