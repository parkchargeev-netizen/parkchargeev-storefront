# Test Quality And Release Readiness Prompt

```text
Bir staff engineer ve release quality reviewer gibi davran.

ParkChargeEV test kalitesi ve release hazırlığını denetle.

İncele:
- typecheck, lint ve build güveni
- runtime smoke test
- admin smoke test
- UI/UX gate
- architecture gate
- integration/contract test eksikleri
- manuel smoke ve regression checklist
- dokümantasyonun gerçek kodla uyumu
- deployment readiness
- rollback düşüncesi
- migration ve env riskleri

Sorular:
- bu sistemde güvenle refactor yapılabilir mi
- release sonrası neyin bozulduğunu anlamak kolay mı
- test yoksa en riskli akışlar hangileri
- prod geçişi için hangi eksikler kritik
- minimum release gate hangi komutlardan oluşmalı

Rapor formatı:
1. Kapsam
2. Test Kalitesi Bulguları
3. Release Readiness Bulguları
4. Smoke ve Regression Güveni
5. Dokümantasyon Uyum Analizi
6. Skor Kartı
7. Release Öncesi Minimum Checklist
```
