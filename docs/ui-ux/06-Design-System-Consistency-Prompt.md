# Design System Consistency Prompt

```text
Bir design systems architect gibi davran.

ParkChargeEV uygulamasında gerçek bir design system var mı, yoksa birikmiş stiller mi var, bunu analiz et.

Özellikle şu sorulara cevap ver:
- kaç farklı button tipi var
- kaç farklı input stili var
- kaç farklı kart yapısı var
- kaç farklı radius mantığı var
- kaç farklı text scale kullanılıyor
- seçili, hover, active, disabled state mantığı standardize mi
- site ve admin aynı marka dili içinde mi, yoksa farklı ürünler gibi mi duruyor
- aynı component farklı sayfalarda farklı yazılıyor mu
- inline style veya page-level override aşırımı var mı

Denetlenecek sistem alanları:
- typography tokens
- spacing scale
- color roles
- radius scale
- elevation / shadow sistemi
- button system
- input system
- card system
- status system
- icon rules
- table/list rules
- product card rules
- admin table/form rules

Rapor formatı:
1. Kapsam
2. Mevcut Sistem Düzeyi
3. Dağınık Alanlar
4. Token Seviyesi Tutarsızlıklar
5. Component Seviyesi Tutarsızlıklar
6. State Seviyesi Tutarsızlıklar
7. Sistemik Riskler
8. Önerilen Design System Kurulumu

Son bölümde şunu yaz:
- önce hangi tokenlar tanımlanmalı
- önce hangi 5 component tekilleştirilmeli
- önce hangi ekranlar normalize edilmeli
```
