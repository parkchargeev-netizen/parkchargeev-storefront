# ParkChargeEV Admin Panel 2026 Tasarim Plani

## Karar Ozeti

ParkChargeEV icin en uygun admin panel yaklasimi:

- hazir "admin framework" degil
- mevcut Next.js 15 + React 19 + Drizzle + Zod + React Hook Form yapisini koruyan
- operasyon odakli, queue-first, list-detail agirlikli
- headless UI prensibiyle kurulan ozel bir admin panel

Bu repo icin en iyi teknik karar:

- veri ve auth katmanini mevcut custom yapida tutmak
- UI katmaninda `shadcn/ui` + `Radix Primitives` + `TanStack Table` desenlerini kullanmak
- mutasyonlarda App Router tarafinda `updateTag` ve `revalidateTag` ile read-your-own-writes davranisi saglamak
- admin ekranlarini server-rendered shell + client island mantigiyla parcali hale getirmek

Bu karar, mevcut kod tabanina en dusuk kirilimla en yuksek uzun vadeli esnekligi verir.

## Neden Hazir Admin Framework Degil

Bu projede admin panel sadece CRUD ekrani degil. Su alanlar birlikte yonetiliyor:

- urun katalogu
- siparis akisi
- PayTR odeme durumu
- teklif pipeline'i
- SEO ve AI summary alanlari
- audit log ve durum gecmisi
- rol bazli erisim

Yani ihtiyac "CMS paneli" degil, "operasyon paneli".

Hazir admin frameworkler hizli baslangic saglar ama su noktalarda erken sinira dayanir:

- PayTR, teklif, siparis ve urun iliskilerinin ayni deneyimde toplanmasi
- kategori, aksesuar, iliskili urun, medya, specs gibi cok parcali urun editoru
- rol bazli is akislari
- gecici fallback veri modu gibi proje-ozel davranislar
- App Router streaming, loading ve cache stratejileriyle dogrudan uyum

Bu nedenle en uygun yapi:

- domain'e gore tasarlanmis ozel admin deneyimi
- ama UI primitive'leri ve tablo altyapisi headless ve standart

## Guncel Kaynaklardan Cikan Tasarim Sonuclari

Arastirma sonucu mevcut yapi icin en anlamli teknik cikarimlar:

1. Next.js App Router tarafinda beklenen hatalar explicit donus degerleriyle modellenmeli.
   Bu, admin form ve durum guncellemelerinde server validation hatalarini temiz gostermeyi kolaylastirir.

2. `loading.tsx`, `error.tsx` ve streaming kullanan parcali admin ekranlari artik temel bir UX beklentisi.
   Ozellikle dashboard, listeler ve detay panellerinde kesintisiz navigation icin bu yaklasim cok uygun.

3. Parallel Routes, dashboard ve yan panel/drawer senaryolari icin cok uygun.
   Ama tum admini bununla kurmak yerine sadece yuksek degerli alanlarda kullanilmasi daha dogru.

4. Tag-based cache invalidation, admin mutasyonlari icin path-based invalidation'dan daha hassas.
   Urun, siparis ve teklif mutasyonlarinda `updateTag` ve `revalidateTag` standardi benimsenmeli.

5. TanStack Table'in column pinning, row selection, faceting, sorting, pagination ve virtualization ozellikleri bu proje tipine cok uygun.
   Siparis ve teklif ekranlari icin bu kritik.

6. shadcn'nin "tek buyuk datatable component'i yerine ihtiyaca gore kurulmus reusable tablo parcalari" yaklasimi bu repo icin dogru.
   Cunku urun, siparis ve teklif tablolarinin davranislari farkli.

7. Radix Primitives ve WAI-ARIA desenleri, keyboard-first admin paneller icin en saglam tabani veriyor.
   Dropdown, dialog, sheet ve menuler icin kendi primitive'lerini sifirdan yazmaya gerek yok.

8. React 19 `useOptimistic`, hizli durum degisiklikleri icin uygun.
   Ozellikle siparis durumu, teklif durumu ve publish/unpublish aksiyonlarinda guclu.

9. React Hook Form'un az re-render uretecek form modeli, sizdeki buyuk urun formlari icin halen cok uygun.

## ParkChargeEV Icin Onerilen Admin Kimligi

Onerilen admin panel tipi:

- operasyon merkezi
- veri yogun ama okunabilir
- masaustu oncelikli
- mobilde gorev takibi ve hizli kontrol odakli

Panelin hissettirmesi gereken sey:

- "backoffice"
- "catalog + payments + sales operations command center"

Yani odak:

- gosterisli marketing dashboard degil
- hizli karar aldiran, dar bogazlari gosteren, siradaki isi one cikan panel

## Onerilen Bilgi Mimarisi

### 1. Dashboard

Amac:

- bugun ne aksiyon gerektiriyor?
- hangi para akisi / teklif / siparis riskte?
- hangi ekip neyi bekliyor?

Bolumler:

- Bugunluk operasyon ozeti
- Bekleyen aksiyon kuyruklari
- Odeme ve siparis anomali listesi
- Yeni teklifler
- Stok / yayinlama uyarilari
- Son audit hareketleri

### 2. Operasyon Kuyrugu

Bu yeni alan mevcut yapiniza cok uygun olur.

Tek ekranda:

- odeme bekleyen siparisler
- callback uyumsuzluklari
- teklif geri donus bekleyen kayitlar
- eksik SEO alanli urunler
- stok esigi altindaki urunler

Bu ekran "yonetici ana ekranindan daha kullanisli" bir gunluk calisma alani olur.

### 3. Urunler

Iki temel mod:

- Liste
- Editor

Liste:

- kaydedilmis gorunumler
- sticky kolonlar
- bulk aksiyonlar
- SEO tamlik skoru
- stok / fiyat / publish durumu

Editor:

- tek uzun form yerine asamali sekmeler

Onerilen editor sekmeleri:

- Genel
- Ticari Bilgiler
- Teknik Ozellikler
- Medya
- SEO ve AI
- Iliskili Urunler
- Yayin ve Notlar

### 4. Siparisler

Ana desen:

- tablo + detay sayfasi + timeline

Liste gorunumu:

- durum
- odeme durumu
- musteri
- toplam
- son hareket
- risk etiketi

Detay sayfasi:

- ustte siparis ozeti
- sagda hizli aksiyon karti
- altta satirlar, odeme, timeline, audit, notlar

### 5. Teklifler

Iki gorunum olmali:

- Table view
- Pipeline view

Table view:

- satis ekibi icin hizli filtreleme

Pipeline view:

- `new -> reviewing -> proposal_sent -> negotiation -> won/lost`

Bu modulde kanban kullanimi mantikli, ama gercek veri yogunlukta tablo da korunmali.

### 6. Icerik ve SEO

Su an urun editorunde gomulu.
Bir sonraki fazda ayri moduller acilmali:

- Blog
- Landing blocks
- Schema / metadata kontrolu
- AI summary kalite kontrolu

### 7. Ayarlar ve Audit

- Admin kullanicilari
- Roller
- Entegrasyon sagligi
- Runtime env sagligi
- Audit log

## Onerilen Ekran Desenleri

### A. List-Detail Standarti

Tum operasyon verilerinde ortak desen:

- solda filtrelenebilir liste
- detay ya full page ya da side sheet
- ustte global arama + kaydedilmis gorunum

Bu desen:

- siparisler
- teklifler
- urunler

icin ortaklasirsa panel ogrenirligi ciddi artar.

### B. Sticky Action Bar

Ozellikle urun editorunde:

- Kaydet
- Taslak yap
- Yayinla
- Onizle
- Geri al

aksiyonlari hep gorunur olmali.

### C. Right-Side Context Panel

Detay ekranlarinda sag panel:

- ozet
- son hareketler
- notlar
- iliskili kayitlar

Bu desen siparis ve teklifte cok degerli.

### D. Bulk Action Toolbar

Liste ekranlarinda secili satir olunca acilan ikincil toolbar:

- durum guncelle
- export
- assignee ata
- arsivle

### E. Empty / Loading / Error States

Admin panelde bunlar sonradan eklenmemeli, baslangicta tasarlanmis olmali.

Her kritik route icin:

- `loading.tsx`
- `error.tsx`
- bos sonuc ekranlari
- "retry" aksiyonu

olmasi gerekir.

## Teknik Mimari Onerisi

### 1. Genel Yapi

En uygun mimari:

- Server Component page shell
- Client Component interaction islands
- repository katmani veri kaynagi olarak korunur
- mutasyonlar route handler ya da server action ile yapilir

Bu repo icin mantikli dagilim:

- page seviyesinde veri toplama: server
- tablo state, filtre UI, dropdown, drawer, optimistic aksiyonlar: client
- veri yazma: route handler veya server action

### 2. Mutasyon Modeli

Kisa vadede:

- mevcut route handler yapisi korunabilir

Orta vadede:

- yuksek frekansli admin aksiyonlari server action'a alinabilir

Server action'a alinmasi en anlamli aksiyonlar:

- siparis durum degisikligi
- teklif durum degisikligi
- urun publish/unpublish
- urun kaydet / kopyala

Sebep:

- `updateTag` ile kullanicinin kendi degisikligini aninda gormesi
- `useOptimistic` ile daha akici aksiyon deneyimi

### 3. Cache ve Revalidation

Veri alanlari tag bazli ayrilmali:

- `admin:dashboard`
- `admin:orders`
- `admin:order:{id}`
- `admin:quotes`
- `admin:quote:{id}`
- `admin:products`
- `admin:product:{id}`

Mutasyon sonrasi:

- detay icin `updateTag`
- liste ve ozet kartlari icin `revalidateTag`

Bu, gereksiz tum sayfa invalidation'i engeller.

### 4. Tablo Altyapisi

Urun, siparis ve teklif listeleri icin ortak bir "admin table kit" kurulmasi en uygun yol.

Ama tek bir mega component degil.

Reusable parcali yapi:

- `DataTableShell`
- `DataTableToolbar`
- `DataTableFilters`
- `DataTableViewOptions`
- `DataTablePagination`
- `RowActionsMenu`
- `BulkActionsBar`

Her resource kendi kolon tanimini getirir:

- `product-columns.tsx`
- `order-columns.tsx`
- `quote-columns.tsx`

### 5. Buyuk Formlar

Mevcut `ProductForm` dogru temelde ama bilgi yogunlugu cok yuksek.

Onerilen form yapisi:

- `FormProvider`
- sekmeli alt formlar
- field group bazli bilelesenme
- autosave draft opsiyonu
- publish onayi ayri aksiyon

Buyuk alanlar:

- medya
- specs
- iliskili urunler
- SEO alanlari

ayri surface card bloklarina bolunmeli.

### 6. Parallel Routes Kullanimi

Tum admini Parallel Routes ile kurmak yerine, su alanlarda kullanmak en mantiklisi:

- Dashboard slotlari:
  - `@queues`
  - `@analytics`
  - `@activity`

- Global drawer / quick view:
  - siparis detay onizleme
  - teklif detay onizleme
  - urun quick edit

- role bazli conditional slotlar:
  - satis
  - operasyon
  - editor

Bu, App Router avantajini alir ama yapayi gereksiz karmasiklastirmaz.

## UI Kutuphanesi Onerisi

### Tutulacaklar

- `react-hook-form`
- `zod`
- `tiptap`
- `recharts`

### Eklenmesi Onerilenler

- `@tanstack/react-table`
- `@tanstack/react-virtual`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-tabs`
- `@radix-ui/react-popover`
- `@radix-ui/react-select`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-toast`
- `shadcn/ui` uzerinden ortak UI primitive seti

Bu kombinasyon, tamamen bu stack'e uygun.

## Gorsel Tasarim Yonu

Panelin gorsel dili:

- acik tema ana varsayim
- yogun ama sikisik degil
- marka mavisi + yesil sadece vurgu rengi
- nobet ve risk durumlarinda sari/kirmizi sistematik kullanilmali

Onerilen token mantigi:

- primary: marka mavisi
- success: yesil
- warning: amber
- danger: kirmizi
- neutral: slate tabanli

Gorsel karakter:

- marketing site kadar "parlak" degil
- operasyon araci kadar net
- tablo ve formlar icin yuksek kontrast
- action butonlari tutarli

## Dashboard Wireframe Onerisi

```text
+---------------------------------------------------------------+
| Search / Command Palette | Saved View | Date | Team Filter    |
+---------------------------------------------------------------+
| KPI 1 | KPI 2 | KPI 3 | KPI 4 | KPI 5 | KPI 6                |
+-------------------------------------------+-------------------+
| Operasyon Kuyrugu                          | Son Audit / Notes |
| - payment pending                          | - status updates   |
| - quote follow-up                          | - admin actions    |
| - stock warning                            | - callback issues  |
+-------------------------------------------+-------------------+
| Revenue Trend                              | Quote Pipeline     |
+-------------------------------------------+-------------------+
| Riskli Siparisler                          | Yeni Teklifler     |
+---------------------------------------------------------------+
```

Bu layout, mevcut `dashboard-charts.tsx` yapisinin daha operasyonel bir versiyonuna evrilmeli.

## Urun Editoru Wireframe Onerisi

```text
+----------------------------------------------------------------+
| Back | Product Name | Draft/Active | Save | Publish | Preview   |
+----------------------------------------------------------------+
| Tabs: Genel | Ticari | Teknik | Medya | SEO/AI | Iliskiler     |
+----------------------------------------------------------------+
| Main form area                                  | Side context  |
| - section cards                                 | - slug        |
| - field groups                                  | - SEO score   |
| - media/spec repeaters                          | - stock warn  |
| - rich text                                     | - last update |
+----------------------------------------------------------------+
```

Buradaki ana fikir:

- tek uzun formsuz ekran
- sekmeli bilgi mimarisi
- sag panelde kalite ve yayin durumu

## Siparis Detay Wireframe Onerisi

```text
+----------------------------------------------------------------+
| Order # | Customer | Payment Status | Total | Quick Actions     |
+----------------------------------------------------------------+
| Timeline / status history             | Payment + shipping     |
+----------------------------------------------------------------+
| Order lines                           | Customer + notes       |
+----------------------------------------------------------------+
| Audit log                             | Related activity       |
+----------------------------------------------------------------+
```

Bu yapi PayTR ve durum gecmisini daha okunur hale getirir.

## Teklif Ekrani Wireframe Onerisi

```text
+---------------------------------------------------------------+
| Table View | Pipeline View | Search | Segment | Status | Owner |
+---------------------------------------------------------------+
| New | Reviewing | Proposal Sent | Negotiation | Won | Lost    |
+---------------------------------------------------------------+
| cards / rows                                                |
+---------------------------------------------------------------+
```

Satis ekibi icin table + kanban cift modu daha uygun olur.

## Rol Bazli Deneyim

Mecvut rol yapiniz dogru bir temel veriyor ama deneyim de buna gore ayrismali.

### Superadmin

- tam gorunum
- sistem sagligi
- audit
- ayarlar

### Sales

- teklifler
- siparisler
- urun yayina hazirlama
- CRM benzeri queue

### Operations

- fulfilment
- stok ve servis akislari
- odeme / callback istisnalari

### Editor

- urun icerigi
- SEO
- blog / schema

Yani ayni navigation herkese gostermek yerine role gore sade ekran gerekir.

## Uygulama Yol Haritasi

### Faz 1: Foundation Refactor

- admin UI primitive seti kur
- reusable data-table kit kur
- `loading.tsx` ve `error.tsx` segmentleri ekle
- global command bar ve filter bar tasarla
- visual tokenlari netlestir

### Faz 2: Core Screens

- dashboardu operasyon kuyrugu odakli yenile
- urun listesi ve editoru sekmeli hale getir
- siparis detay sayfasini timeline + quick action modeline cevir
- teklifler icin dual mode table/pipeline kur

### Faz 3: Productivity

- bulk actions
- saved views
- keyboard shortcuts
- command palette
- optimistic status changes
- side drawer quick preview

### Faz 4: Governance

- audit ekranlari
- sistem sagligi
- runtime config health
- role bazli dashboard varyantlari

## Kod Tabanina Gore Onerilen Dosya Organizasyonu

```text
src/
  app/admin/
    (panel)/
      page.tsx
      loading.tsx
      error.tsx
      @activity/
      @queues/
      @analytics/
      urunler/
        page.tsx
        loading.tsx
        [id]/
      siparisler/
        page.tsx
        [id]/
      teklifler/
        page.tsx
        [id]/
  components/admin/
    ui/
    table/
    filters/
    forms/
    panels/
    status/
  server/admin/
    queries/
    mutations/
    presenters/
```

Mevcut `repository.ts` zamanla ikiye ayrilmali:

- `queries`
- `mutations`

Bu ayrim panel buyudukce ciddi kolaylik saglar.

## Son Tavsiye

Bu proje icin en iyi admin panel:

- ozellestirilmis
- operasyon odakli
- TanStack Table temelli
- Radix/Shadcn primitive'leriyle erisebilir
- Next.js App Router'in loading, error, revalidation ve parallel route avantajlarini kullanan
- React Hook Form + Zod ile buyuk formlari yoneten
- read-heavy shell + action-heavy islands modeline dayanan

Kisa karar cumlesi:

ParkChargeEV icin en uygun admin panel "generic CRUD dashboard" degil, "queue-first EV commerce operations console" olmali.

## Kaynaklar

- Next.js Error Handling
  - https://nextjs.org/docs/app/getting-started/error-handling
- Next.js loading.js
  - https://nextjs.org/docs/app/api-reference/file-conventions/loading
- Next.js Parallel Routes
  - https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes
- Next.js Revalidating
  - https://nextjs.org/docs/app/getting-started/revalidating
- Next.js revalidateTag
  - https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- React `useOptimistic`
  - https://react.dev/reference/react/useOptimistic
- shadcn/ui Data Table
  - https://ui.shadcn.com/docs/components/data-table
- TanStack Table Features
  - https://tanstack.com/table/latest/docs/guide/features
- TanStack Table Column Pinning
  - https://tanstack.com/table/latest/docs/guide/column-pinning
- TanStack Table Row Pinning
  - https://tanstack.com/table/latest/docs/api/features/row-pinning
- WAI-ARIA Treegrid Pattern
  - https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/
- Radix Primitives Accessibility
  - https://www.radix-ui.com/primitives/docs/overview/accessibility
- Radix Dropdown Menu
  - https://www.radix-ui.com/primitives/docs/components/dropdown-menu
- Radix Dialog
  - https://www.radix-ui.com/primitives/docs/components/dialog
