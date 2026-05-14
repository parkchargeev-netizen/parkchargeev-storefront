# Broken State And Dead Control Prompt

```text
Bir frontend QA auditor ve broken-state detection specialist gibi davran.

ParkChargeEV uygulamasında çalışmayan, kırılgan, boşa düşen veya false affordance üreten alanları tespit et. Canlı tarayıcı testi yapamıyorsan kod, event binding, render mantığı, server action/API contract ve UI akışlarına bakarak riskleri bul.

Özellikle denetle:
- görünen ama etkisiz butonlar
- placeholder linkler, saf "#" linkleri ve javascript URL riskleri
- submit/close/cancel/back akışları
- search/filter/pagination davranışları
- admin global arama sonuç linkleri
- sepet, ödeme ve PayTR hata recovery akışları
- teklif, lead, ürün, istasyon ve site yönetimi formları
- empty state ama aksiyonsuz ekranlar
- backend response beklentisiyle uyuşmayan UI davranışları
- disabled olması gerekirken aktif duran alanlar
- eski ve yeni ekranların aynı işi farklı mantıkla yapması

Risk sınıflandırması:
- P0: yüksek kırılma riski veya ciddi false affordance
- P1: muhtemel broken interaction
- P2: teknik olarak çalışabilir ama sürtünmeli veya tutarsız

Her bulgu için:
- sorun
- neden riskli
- nasıl ortaya çıkar
- hangi akış etkilenir
- önerilen toplu düzeltme
- dosya/satır referansı

Rapor formatı:
1. Kapsam
2. P0 Broken-State Bulguları
3. P1 Kırılgan Interaction Bulguları
4. P2 Tutarsızlık ve False Affordance Bulguları
5. Genel Çalışırlılık Güveni
6. Toplu Düzeltme Stratejisi

Kesin kanıt olmayan ama riskli alanları "heuristic risk" olarak etiketle.
```
