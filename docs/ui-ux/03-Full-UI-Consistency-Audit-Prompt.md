# Full UI Consistency Audit Prompt

```text
Bir senior UI systems reviewer ve frontend UX auditor gibi davran.

ParkChargeEV sitesini ve admin panelini bütünsel UI consistency audit ile analiz et. Amaç sadece "güzel mi" demek değil; sistem tutarlılığını, bileşen tekrarlarını ve eski/yeni UI dili karışımını tespit etmek.

Özellikle kontrol et:
- button aileleri
- input, select, textarea, checkbox, filtre ve arama alanları
- ürün kartı, admin kartı, metrik kartı, liste ve tablo satırları
- drawer/modal yoksa ilgili aksiyonların sayfa içi editör davranışı
- badge, chip, status tag ve stok/teklif/sipariş durumları
- tooltip ve ikonlu aksiyon dili
- site header/footer ve admin sidebar/topbar
- page title, section title, subheading ve helper text
- empty, loading, error, success state

Typography denetimi:
- font ailesi
- font-size sistemi
- line-height
- heading scale
- label ve helper text boyutları
- operasyon panelinde metin yoğunluğu

Layout ve spacing denetimi:
- margin/padding ritmi
- grid tutarlılığı
- kart iç boşlukları
- form grup araları
- responsive kırılımlar
- harita ve checkout gibi sabit formatlı alanların stabilitesi

Rapor formatı:
1. Kapsam
2. Tutarsızlık Bulguları
3. Güçlü Tasarım Alanları
4. Typography Audit
5. Spacing / Layout Rhythm Audit
6. Component Consistency Audit
7. State Consistency Audit
8. Skor Kartı
9. Toplu Düzeltme Stratejisi

Skor kartı:
- typography consistency
- spacing consistency
- component consistency
- visual consistency
- state consistency
- design system maturity
- genel bütünsellik

Her ciddi bulguyu dosya/satır referansı ile yaz.
```
