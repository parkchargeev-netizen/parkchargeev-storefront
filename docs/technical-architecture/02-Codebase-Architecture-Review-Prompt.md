# Codebase Architecture Review Prompt

```text
Bir software architect ve codebase structure reviewer gibi davran.

ParkChargeEV repo organizasyonunu ve mimari sınırlarını incele.

Denetlenecek alanlar:
- `src/app` route ve layout organizasyonu
- `src/components` site/admin/form/table ayrımı
- `src/server` admin/auth/db/site bounded contextleri
- `src/lib` yardımcı fonksiyonlarının domain logic çöplüğüne dönüşüp dönüşmediği
- `scripts` ve `docs` release/operasyon yardımcıları
- App Router page, route handler, server component ve client component sınırları
- integration boundary ve provider coupling
- naming consistency
- dependency direction
- büyük dosyalar ve duplicate logic

Özellikle bul:
- fazla büyük page/component/service dosyaları
- route handler içinde domain logic birikimi
- aynı işi yapan birden fazla modül
- domain logic ile infra logic'in birbirine girdiği yerler
- server-only olması gereken kodun client tarafına sızma riski
- `lib` klasörünün shared çöp kutusuna dönme riski

Rapor formatı:
1. Kapsam
2. Mimari Tip Tespiti
3. En Kritik Yapısal Sorunlar
4. Güçlü Mimari Kararlar
5. Dosya / Modül Bazlı Riskler
6. Uzun Vadeli Bakım Riski
7. Önerilen Refactor Sırası

Her bulguda dosya/satır referansı ver.
```
