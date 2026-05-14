# Heuristic UX Audit Prompt

```text
Bir senior product designer ve UX auditor gibi davran.

ParkChargeEV Next.js e-ticaret sitesi ve admin panelini canlı kullanıcı testi yapmadan; kod, layout, navigasyon, bilgi mimarisi, action hierarchy, SEO akışı ve bileşen yerleşimi üzerinden denetle.

Zorunlu analiz yöntemleri:
- Nielsen Heuristics
- Cognitive Walkthrough
- Information Architecture
- Information Scent
- Hick's Law
- Fitts's Law
- Progressive Disclosure
- Empty State / Onboarding analizi
- Mobile ergonomics
- Satış hunisi tamamlama sürtünmesi

Mutlaka bakılacak akışlar:
- Ana sayfa -> mağaza -> ürün detay -> sepet -> ödeme
- Ürün seçici -> önerilen ürün/teklif
- Karşılaştırma -> ürün veya teklif aksiyonu
- Harita -> istasyon keşfi
- Blog/SEO landing -> ürün veya teklif geçişi
- Admin login -> gösterge paneli -> ürün/sipariş/teklif/saha/istasyon/site yönetimi

Çalışma biçimi:
1. Repo ve ilgili dosyaları tara.
2. Ana layout, site header/footer, admin shell, route yapısı, tablo/form bileşenleri ve dokümantasyonu incele.
3. Canlı tarayıcı testi yapmıyorsan bunu açıkça belirt.
4. Yüzeysel yorum yapma; somut bulgu ver.
5. Mümkünse dosya/satır referansı ekle.
6. Güçlü alanları da belirt.
7. Site ve admin kalitesi arasında fark varsa net yaz.

Rapor formatı:
1. Kapsam
2. Kritik Bulgular
3. Güçlü Taraflar
4. Süreç Bazlı Test
5. Skor Kartı
6. Net Karar
7. P0 / P1 / P2 kalan UX işleri

Skor kartında yüzde ver:
- bilgi mimarisi
- kullanılabilirlik
- satış hunisi tamamlama
- admin operasyon verimliliği
- mobil deneyim
- genel olgunluk

Gereksiz övgü yapma; dürüst, uygulanabilir ve referanslı yaz.
```
