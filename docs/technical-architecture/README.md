# ParkChargeEV Technical Architecture Test Pack

Bu klasör, `Technical-Architecture-Test-Pack` içeriğinin ParkChargeEV Next.js e-ticaret sitesi ve admin paneli için uyarlanmış halidir.

## Kapsam

- Kod yapısı ve modülerlik
- Next.js App Router route yapısı
- Backend API ve service sınırları
- Drizzle/PostgreSQL veri modeli
- Supabase/Postgres, PayTR ve webhook entegrasyonları
- Auth, session, rol ve runtime güvenliği
- Performans, ölçeklenebilirlik ve gözlemlenebilirlik
- Test kalitesi ve release readiness

Canlıya alma operasyon runbook'u için: `../canliya-alma-entegrasyonu.md`

## Kullanım Sırası

1. `01-Master-Technical-Audit-Prompt.md`
2. `10-Master-Technical-QA-Checklist.md`
3. Alan bazlı derin iniş için `02` - `09` arasındaki promptlar

## Otomatik Mimari Kapı

```bash
npm run verify:architecture
```

Bu komut proje özel teknik denetim dokümanlarının varlığını, kritik katman dosyalarını, API route handler yüzeyini, release scriptlerini ve bariz secret sızıntısı kalıplarını kontrol eder.
