# ParkChargeEV UI/UX Test Paketi

Bu klasör, `UI-UX-Test-Pack` içeriğinin ParkChargeEV e-ticaret sitesi ve admin paneli için uyarlanmış halidir.

## Kullanım Sırası

0. `parkchargeev-2026-canli-pazar-persona-ux-satis-raporu.md`
1. `01-Master-UI-UX-QA-Checklist.md`
2. `02-Heuristic-UX-Audit-Prompt.md`
3. `03-Full-UI-Consistency-Audit-Prompt.md`
4. `04-Broken-State-And-Dead-Control-Prompt.md`
5. `05-Task-Based-Manual-QA-Runbook.md`
6. `06-Design-System-Consistency-Prompt.md`
7. `07-Regression-And-Release-Gate.md`

## Otomatik Kapı

```bash
npm run verify:uiux
```

Bu komut temel UI/UX dokümanlarının projeye özgü şekilde durduğunu, kritik rota dosyalarının varlığını ve bariz ölü kontrol kalıplarını kontrol eder.

Release öncesi tam kontrol:

```bash
npm run verify:release
```
