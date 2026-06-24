# ParkChargeEV UI/UX Test Paketi

Bu klasör, `UI-UX-Test-Pack` içeriğinin ParkChargeEV e-ticaret sitesi ve admin paneli için uyarlanmış halidir.

## Kullanım Sırası

0. `parkchargeev-2026-canli-pazar-persona-ux-satis-raporu.md`
1. `parkchargeev-2026-site-geneli-yeni-tasarim-blueprint.md`
2. `01-Master-UI-UX-QA-Checklist.md`
3. `02-Heuristic-UX-Audit-Prompt.md`
4. `03-Full-UI-Consistency-Audit-Prompt.md`
5. `04-Broken-State-And-Dead-Control-Prompt.md`
6. `05-Task-Based-Manual-QA-Runbook.md`
7. `06-Design-System-Consistency-Prompt.md`
8. `07-Regression-And-Release-Gate.md`

## Otomatik Kapı

```bash
npm run verify:uiux
```

Bu komut temel UI/UX dokümanlarının projeye özgü şekilde durduğunu, kritik rota dosyalarının varlığını ve bariz ölü kontrol kalıplarını kontrol eder.

Release öncesi tam kontrol:

```bash
npm run verify:release
```

## 2026 Site Geneli Tasarim Sistemi

- ParkChargeEV arayuzu `src/components/ui` altindaki ortak `PageHeader`, `Text`, `Surface`, `ActionLink/ActionButton` ve `StatusBadge` primitive'leriyle ilerler.
- Font ailesi sistem yigininda kalir; ana baslik mobilde 32/40, masaustunde 40/48; bolum basliklari 26/34 ve 32/40 olcegindedir.
- Kart ve kontrol radius standardi 8px'tir; yalniz durum rozetleri pill formunda kalabilir.
- Urun karti tek tiklanabilir hedef olarak urun detayina gider; kart icinde ayri Kesif/Incele linki bulunmaz.
- Motion sistemi `data-motion`, `data-motion-scope`, `data-motion-loop` ve `data-motion-skip` sozlesmeleriyle calisir; `prefers-reduced-motion` altinda icerik dogrudan gorunur olur.
