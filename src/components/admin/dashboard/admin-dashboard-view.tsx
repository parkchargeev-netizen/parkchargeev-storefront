import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Building2,
  Cable,
  CheckCircle2,
  Clock3,
  CreditCard,
  Database,
  FileText,
  Gauge,
  Home,
  LockKeyhole,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingCart,
  Target,
  Users,
  Wrench,
  Zap
} from "lucide-react";

import { AdminPrefetchLink } from "@/components/admin/admin-prefetch-link";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { formatPriceTRY } from "@/lib/format";
import {
  adminOpsChecklist,
  adminRevenuePlays,
  marketPanelInsights
} from "@/lib/panel-experience";
import { serviceCoverageSummary } from "@/lib/service-coverage";
import type { AdminDashboardSnapshot } from "@/server/admin/dashboard";
import type { AdminRole } from "@/server/auth/authorization";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

type AdminDashboardViewProps = {
  snapshot: AdminDashboardSnapshot;
  role?: AdminRole;
  databaseEnabled: boolean;
  paytrReady: boolean;
};

const orderStatusLabels: Record<string, string> = {
  draft: "Taslak",
  pending_payment: "Odeme bekliyor",
  payment_processing: "Odeme isleniyor",
  pending_confirmation: "Onay bekliyor",
  paid: "Odendi",
  confirmed: "Onaylandi",
  shipped: "Kargoda",
  delivered: "Teslim edildi",
  failed: "Basarisiz",
  cancelled: "Iptal",
  refunded: "Iade",
  fulfilled: "Tamamlandi"
};

const quoteStatusLabels: Record<string, string> = {
  new: "Yeni talep",
  reviewing: "Inceleniyor",
  proposal_sent: "Teklif gonderildi",
  negotiation: "Muzakere",
  won: "Kazanildi",
  lost: "Kaybedildi"
};

const leadStatusLabels: Record<string, string> = {
  new: "Yeni",
  contacted: "Iletisime gecildi",
  qualified: "Nitelikli",
  scheduled: "Planlandi",
  won: "Kazanildi",
  lost: "Kaybedildi"
};

const personaCards: Array<{
  href: string;
  label: string;
  detail: string;
  signal: string;
  tone: Tone;
  icon: ReactNode;
}> = [
  {
    href: "/admin/teklifler",
    label: "Ev tipi AC alicisi",
    detail: "7.4/11 kW wallbox, arac uyumu ve Sakarya kesfiyle hizli kapanir.",
    signal: "Hizli donusum",
    tone: "success",
    icon: <Home className="h-5 w-5" />
  },
  {
    href: "/admin/saha",
    label: "Site / apartman",
    detail: "RFID, adil kullanim ve yonetim sunumu teknik planla ilerler.",
    signal: "Toplu karar",
    tone: "info",
    icon: <Building2 className="h-5 w-5" />
  },
  {
    href: "/admin/teklifler",
    label: "KOBI / ofis",
    detail: "22 kW AC, misafir deneyimi, servis ve fatura akisi birlikte sunulur.",
    signal: "Kurumsal teklif",
    tone: "warning",
    icon: <Users className="h-5 w-5" />
  },
  {
    href: "/admin/saha",
    label: "Ticari lokasyon",
    detail: "DC veya coklu AC saha icin enerji kapasitesi ve fizibilite notu gerekir.",
    signal: "Fizibilite",
    tone: "danger",
    icon: <MapPin className="h-5 w-5" />
  },
  {
    href: "/admin/urunler",
    label: "Kablo / aksesuar",
    detail: "Type 2 uyum, stok gorunurlugu ve hizli sepet donusumu takip edilir.",
    signal: "Hizli satis",
    tone: "neutral",
    icon: <Cable className="h-5 w-5" />
  }
];

const moduleCards: Array<{
  href: string;
  label: string;
  detail: string;
  icon: ReactNode;
  roles: AdminRole[];
}> = [
  {
    href: "/admin/urunler",
    label: "Urun merkezi",
    detail: "Fiyat, stok, varyant, SEO, gorsel ve teknik ozellikleri yonet.",
    icon: <Package className="h-5 w-5" />,
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/siparisler",
    label: "Siparis operasyonu",
    detail: "Odeme, kargo, fatura, not ve teslimat adimlarini takip et.",
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/teklifler",
    label: "Teklif CRM",
    detail: "Bireysel, site, isletme ve filo taleplerini aksiyona cevir.",
    icon: <FileText className="h-5 w-5" />,
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/saha",
    label: "Saha planlama",
    detail: "Kesif, kurulum, servis ve lokasyon kapsamlarini netlestir.",
    icon: <Wrench className="h-5 w-5" />,
    roles: ["superadmin", "operations", "technician"]
  },
  {
    href: "/admin/blog",
    label: "Icerik ve SEO",
    detail: "Blog, rehber, arama niyeti ve satis destekli icerikleri yayinla.",
    icon: <BookOpen className="h-5 w-5" />,
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/paytr",
    label: "Odeme merkezi",
    detail: "PayTR kayitlari, callback ve odeme kontrolunu incele.",
    icon: <CreditCard className="h-5 w-5" />,
    roles: ["superadmin", "sales"]
  }
];

const adminWorkflowCards = [
  {
    label: "1. Bul",
    detail: "Komut aramasiyla siparis, teklif, urun veya musteri kaydina hizli ulasin.",
    icon: <Database className="h-5 w-5" />
  },
  {
    label: "2. Onceliklendir",
    detail: "Bekleyen siparis, teklif ve saha taleplerini acik kuyruk kartlarindan secin.",
    icon: <Target className="h-5 w-5" />
  },
  {
    label: "3. Guncelle",
    detail: "Durum, not, stok, fiyat, kargo, teklif veya servis adimini tek kayitta guncelleyin.",
    icon: <CheckCircle2 className="h-5 w-5" />
  },
  {
    label: "4. Denetle",
    detail: "PayTR, rol, audit ve oturum sinyalleriyle operasyon guvenini kontrol edin.",
    icon: <ShieldCheck className="h-5 w-5" />
  }
] as const;

const commerceAdminStandards: Array<{
  href: string;
  label: string;
  detail: string;
  proof: string;
  icon: ReactNode;
  roles: AdminRole[];
}> = [
  {
    href: "/admin/urunler",
    label: "Katalog kalitesi",
    detail: "Baslik, fiyat, stok, varyant, medya, SEO, AI ve teknik ozellikler eksiksiz tutulur.",
    proof: "Shopify + Woo urun standardi",
    icon: <Package className="h-5 w-5" />,
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/siparisler",
    label: "Siparis ve teslimat",
    detail: "Odeme, onay, kargo, iade, not ve durum akisi tek operasyon ekranindan izlenir.",
    proof: "Fulfillment akisi",
    icon: <ShoppingCart className="h-5 w-5" />,
    roles: ["superadmin", "sales", "operations"]
  },
  {
    href: "/admin/teklifler",
    label: "Musteri ve segment",
    detail: "Ev, site, KOBI ve ticari lokasyon talepleri persona bazli takip edilir.",
    proof: "CRM + segment",
    icon: <Users className="h-5 w-5" />,
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/saha",
    label: "Kesif ve kurulum",
    detail: "Sakarya ucretsiz kesif, Sakarya + Kocaeli kurulum ve servis aksiyonlari ayrisir.",
    proof: "Saha is emri",
    icon: <Wrench className="h-5 w-5" />,
    roles: ["superadmin", "operations", "technician"]
  },
  {
    href: "/admin/blog",
    label: "Icerik ve pazarlama",
    detail: "Blog, rehber, kampanya metni ve satis destekli aciklamalar zengin editorle uretilir.",
    proof: "SEO + CRO icerik",
    icon: <BookOpen className="h-5 w-5" />,
    roles: ["superadmin", "editor", "sales"]
  },
  {
    href: "/admin/paytr",
    label: "Odeme guveni",
    detail: "PayTR kayitlari, odeme callback sinyalleri ve siparis kapanisi kontrol edilir.",
    proof: "Odeme denetimi",
    icon: <CreditCard className="h-5 w-5" />,
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/katalog",
    label: "Toplu operasyon",
    detail: "Katalog duzeni, kanal gorunurlugu ve yinelenen urun kontrolleri hizlanir.",
    proof: "Bulk yonetim",
    icon: <Database className="h-5 w-5" />,
    roles: ["superadmin", "sales", "editor"]
  },
  {
    href: "/admin/audit",
    label: "Rol ve denetim",
    detail: "Rol bazli erisim, oturum, audit ve guvenlik kayitlari is surecine baglanir.",
    proof: "Admin guvenligi",
    icon: <ShieldCheck className="h-5 w-5" />,
    roles: ["superadmin"]
  }
];

function toneClass(tone: Tone) {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "danger":
      return "border-red-200 bg-red-50 text-red-800";
    case "info":
      return "border-cyan-200 bg-cyan-50 text-cyan-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function iconToneClass(tone: Tone) {
  switch (tone) {
    case "success":
      return "bg-emerald-100 text-emerald-700";
    case "warning":
      return "bg-amber-100 text-amber-700";
    case "danger":
      return "bg-red-100 text-red-700";
    case "info":
      return "bg-cyan-100 text-cyan-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function KpiCard({
  label,
  value,
  detail,
  icon,
  tone = "neutral"
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="surface-card border border-white/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">{value}</p>
        </div>
        <span className={`rounded-2xl p-2 ${iconToneClass(tone)}`}>{icon}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function QueueCard({
  href,
  label,
  value,
  detail,
  action,
  icon,
  tone
}: {
  href: string;
  label: string;
  value: number;
  detail: string;
  action: string;
  icon: ReactNode;
  tone: Tone;
}) {
  return (
    <AdminPrefetchLink
      href={href}
      className="surface-card group flex h-full flex-col justify-between border border-white/70 p-5 transition hover:-translate-y-0.5 hover:border-emerald-200"
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`rounded-2xl p-2 ${iconToneClass(tone)}`}>{icon}</span>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${toneClass(tone)}`}>
          {value > 0 ? "Aksiyon var" : "Temiz"}
        </span>
      </div>
      <div className="mt-6">
        <p className="text-sm font-black text-slate-800">{label}</p>
        <p className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">{value}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#063326]">
        {action}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </AdminPrefetchLink>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-sm font-semibold text-slate-500">
      {label}
    </div>
  );
}

export function AdminDashboardView({
  snapshot,
  role,
  databaseEnabled,
  paytrReady
}: AdminDashboardViewProps) {
  const canSee = (roles: AdminRole[]) => (role ? roles.includes(role) : false);
  const openQueueTotal =
    snapshot.kpis.pendingOrders +
    snapshot.kpis.pendingQuotes +
    snapshot.kpis.openServiceRequests;
  const targetProgress = Math.min(snapshot.kpis.targetProgress, 100);
  const targetTone: Tone =
    snapshot.kpis.targetProgress >= 85
      ? "success"
      : snapshot.kpis.targetProgress >= 45
        ? "info"
        : "warning";
  const queueCards = [
    {
      href: "/admin/siparisler?status=pending_confirmation",
      label: "Siparis onayi",
      value: snapshot.kpis.pendingOrders,
      detail: "Odeme, stok, kargo ve fatura kontrolu bekleyen kayitlar.",
      action: "Siparisleri ac",
      icon: <ShoppingCart className="h-5 w-5" />,
      tone: snapshot.kpis.pendingOrders > 0 ? "warning" : "success",
      roles: ["superadmin", "sales"] as AdminRole[]
    },
    {
      href: "/admin/teklifler",
      label: "Teklif aksiyonu",
      value: snapshot.kpis.pendingQuotes,
      detail: "Yeni, inceleme veya muzakeredeki satis firsatlari.",
      action: "Teklif masasina git",
      icon: <FileText className="h-5 w-5" />,
      tone: snapshot.kpis.pendingQuotes > 0 ? "info" : "success",
      roles: ["superadmin", "sales"] as AdminRole[]
    },
    {
      href: "/admin/saha",
      label: "Saha planlama",
      value: snapshot.kpis.openServiceRequests,
      detail: "Kesif, kurulum ve teknik servis ekibine aktarilacak isler.",
      action: "Saha taleplerini ac",
      icon: <Wrench className="h-5 w-5" />,
      tone: snapshot.kpis.openServiceRequests > 0 ? "warning" : "success",
      roles: ["superadmin", "operations", "technician"] as AdminRole[]
    },
    {
      href: role === "superadmin" ? "/admin/adminler" : "/admin/erisim",
      label: "Guvenlik",
      value: snapshot.security.activeSessions,
      detail: "Aktif admin oturumlari, rol kapsami ve denetim kayitlari.",
      action: role === "superadmin" ? "Oturumlari denetle" : "Erisim haritasi",
      icon: <ShieldCheck className="h-5 w-5" />,
      tone: snapshot.security.activeSessions > 1 ? "info" : "neutral",
      roles: ["superadmin", "sales", "operations", "technician", "editor"] as AdminRole[]
    }
  ];
  const visibleQueueCards = queueCards.filter((card) => canSee(card.roles));
  const visibleModules = moduleCards.filter((card) => canSee(card.roles));
  const visibleCommerceStandards = commerceAdminStandards.filter((card) => canSee(card.roles));
  const todayActions = [
    {
      label: "Odeme ve siparis onayi",
      count: snapshot.kpis.pendingOrders,
      href: "/admin/siparisler?status=pending_confirmation",
      detail: "Musteri bekletmeden odeme ve stok kontrolunu kapat."
    },
    {
      label: "Teklif donusu",
      count: snapshot.kpis.pendingQuotes,
      href: "/admin/teklifler",
      detail: "Ev, site ve isletme taleplerinde hizli ilk temas kur."
    },
    {
      label: "Saha takvimi",
      count: snapshot.kpis.openServiceRequests,
      href: "/admin/saha",
      detail: "Sakarya kesif ve Sakarya + Kocaeli kurulum kapsamlarini ayir."
    }
  ].filter((action) => action.count > 0);

  return (
    <div className="space-y-6">
      {!databaseEnabled ? (
        <section className="surface-card border border-amber-200 bg-amber-50/85 p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-700">
            Yerel yedek mod
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Veritabani baglantisi olmadiginda panel yerel yedek veriyle acilir. Canli operasyon icin
            Supabase ortam degiskenlerini kontrol edin.
          </p>
        </section>
      ) : null}

      <section className="surface-card overflow-hidden border border-white/70 p-6 lg:p-8">
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] xl:items-stretch">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#0f8f6f]">
              Admin operasyon merkezi
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-[-0.05em] text-slate-950 lg:text-5xl">
              Satilabilir urun, dogru teklif ve saha aksiyonu tek masada.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              ParkChargeEV paneli; e-ticaret siparislerini, teklif CRM akisini, Sakarya/Kocaeli saha
              planini, icerik operasyonunu ve guvenlik sinyallerini ayni karar ekraninda toplar.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Acik kuyruk
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950">{openQueueTotal}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  7 gun yeni musteri
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {snapshot.kpis.newCustomers}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Kapsam
                </p>
                <p className="mt-2 text-xs font-black leading-5 text-slate-950">
                  {serviceCoverageSummary.shipping}
                  <br />
                  {serviceCoverageSummary.freeSurvey}
                  <br />
                  {serviceCoverageSummary.installation}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] bg-[#063326] p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/55">
                  Aylik hedef
                </p>
                <p className="mt-3 text-5xl font-black tracking-[-0.05em]">
                  %{snapshot.kpis.targetProgress.toFixed(1)}
                </p>
              </div>
              <Target className="h-8 w-8 text-emerald-200" />
            </div>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#7eecc9]"
                style={{ width: `${targetProgress}%` }}
              />
            </div>
            <div className="mt-6 grid gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${toneClass(targetTone)}`}>
                Hedef sinyali
              </span>
              <AdminPrefetchLink
                href="/admin/siparisler"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#063326]"
              >
                Siparis performansi
                <ArrowRight className="h-4 w-4" />
              </AdminPrefetchLink>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {adminWorkflowCards.map((item) => (
          <div key={item.label} className="surface-card border border-white/70 p-5">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-[#063326]">
              {item.icon}
            </span>
            <p className="mt-4 text-sm font-black text-slate-950">{item.label}</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="surface-card border border-white/70 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#0f8f6f]">
              E-ticaret admin standardi
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
              Panel, satisin butun arka ofisini tek akista toplar.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Urun katalog kalitesi, siparis/fulfillment, musteri segmentleri, pazarlama icerigi,
              odeme guveni ve rol denetimi ayni operasyon ritminde ilerler.
            </p>
          </div>
          <AdminPrefetchLink
            href="/admin/urunler"
            className="rounded-2xl bg-[#063326] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#0b4b39]"
          >
            Urun merkezini ac
          </AdminPrefetchLink>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleCommerceStandards.map((item) => (
            <AdminPrefetchLink
              key={item.label}
              href={item.href}
              className="group rounded-3xl border border-slate-200 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-2xl bg-[#d8fff0] p-2 text-[#063326]">{item.icon}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#063326]" />
              </div>
              <p className="mt-4 text-sm font-black text-slate-950">{item.label}</p>
              <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
              <span className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-[#063326]">
                {item.proof}
              </span>
            </AdminPrefetchLink>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleQueueCards.map((card) => (
          <QueueCard
            key={card.label}
            href={card.href}
            label={card.label}
            value={card.value}
            detail={card.detail}
            action={card.action}
            icon={card.icon}
            tone={card.tone as Tone}
          />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Bugunku ciro"
          value={formatPriceTRY(snapshot.kpis.todayRevenue)}
          detail="Bugun olusan onayli siparis toplami."
          icon={<Zap className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Bu ayki ciro"
          value={formatPriceTRY(snapshot.kpis.monthRevenue)}
          detail="Aylik hedef karsilastirmasi icin ana metrik."
          icon={<Gauge className="h-5 w-5" />}
          tone={targetTone}
        />
        <KpiCard
          label="Tamamlanan is"
          value={String(snapshot.kpis.completedInstallations)}
          detail="Bu hafta teslim edilen veya tamamlanan kayitlar."
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Aktif oturum"
          value={String(snapshot.security.activeSessions)}
          detail="Admin oturumlari ve guvenlik izleme sinyali."
          icon={<LockKeyhole className="h-5 w-5" />}
          tone="info"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="surface-card border border-white/70 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#0f8f6f]">
                Bugunun aksiyonlari
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
                Panel once bekleyen isi kapatsin.
              </h2>
            </div>
            <AdminPrefetchLink
              href="/admin/erisim"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              Tum moduller
            </AdminPrefetchLink>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {(todayActions.length > 0
              ? todayActions
              : [
                  {
                    label: "Kritik kuyruk yok",
                    count: 0,
                    href: "/admin",
                    detail: "Yeni siparis, teklif veya saha talebi gelince bu alan otomatik dolacak."
                  }
                ]
            ).map((action) => (
              <AdminPrefetchLink
                key={action.label}
                href={action.href}
                className="group rounded-3xl border border-slate-200 bg-white/70 p-5 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <p className="text-sm font-black text-slate-950">{action.label}</p>
                <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#063326]">
                  {action.count}
                </p>
                <p className="mt-3 text-xs leading-5 text-slate-600">{action.detail}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#063326]">
                  Islemi ac
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </AdminPrefetchLink>
            ))}
          </div>
        </div>

        <div className="surface-card border border-white/70 bg-[#063326] p-6 text-white">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-200">
            Sistem sagligi
          </p>
          <div className="mt-5 grid gap-3">
            {[
              {
                label: "Veri kaynagi",
                status: databaseEnabled ? "Canli" : "Yerel",
                tone: databaseEnabled ? "success" : "warning",
                icon: <Database className="h-4 w-4" />
              },
              {
                label: "PayTR",
                status: paytrReady ? "Hazir" : "Eksik",
                tone: paytrReady ? "success" : "danger",
                icon: <CreditCard className="h-4 w-4" />
              },
              {
                label: "Rol bazli erisim",
                status: "Aktif",
                tone: "success",
                icon: <ShieldCheck className="h-4 w-4" />
              },
              {
                label: "Oturum denetimi",
                status: "Aktif",
                tone: "success",
                icon: <LockKeyhole className="h-4 w-4" />
              }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3">
                <span className="flex items-center gap-3 text-sm font-semibold">
                  {item.icon}
                  {item.label}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-black ${toneClass(item.tone as Tone)}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card border border-white/70 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#0f8f6f]">
              Persona satis rotalari
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
              Her musteri tipi dogru modula dussun.
            </h2>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {personaCards.map((item) => (
            <AdminPrefetchLink
              key={item.label}
              href={item.href}
              className="group rounded-3xl border border-slate-200 bg-white/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-2xl p-2 ${iconToneClass(item.tone)}`}>{item.icon}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#063326]" />
              </div>
              <p className="mt-4 text-sm font-black text-slate-950">{item.label}</p>
              <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
              <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${toneClass(item.tone)}`}>
                {item.signal}
              </span>
            </AdminPrefetchLink>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="surface-card border border-white/70 p-6">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#0f8f6f]">
            Modul kisayollari
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
            Admin panelde beklenen ana ozellikler.
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {visibleModules.map((item) => (
              <AdminPrefetchLink
                key={item.href}
                href={item.href}
                className="group rounded-3xl border border-slate-200 bg-white/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-2xl bg-emerald-100 p-2 text-[#063326]">{item.icon}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#063326]" />
                </div>
                <p className="mt-4 text-sm font-black text-slate-950">{item.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
              </AdminPrefetchLink>
            ))}
          </div>
        </div>

        <div className="surface-card border border-white/70 p-6">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#0f8f6f]">
            Pazar playbook
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
            Satis ekibinin gunluk rehberi.
          </h2>
          <div className="mt-5 grid gap-3">
            {adminRevenuePlays.map((play) => (
              <AdminPrefetchLink
                key={play.label}
                href={play.href}
                className="rounded-3xl border border-slate-200 bg-white/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <span className={`rounded-full border px-3 py-1 text-xs font-black ${toneClass(play.tone)}`}>
                  {play.signal}
                </span>
                <p className="mt-3 text-sm font-black text-slate-950">{play.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{play.detail}</p>
              </AdminPrefetchLink>
            ))}
          </div>
        </div>
      </section>

      <DashboardCharts
        revenueTrend={snapshot.charts.revenueTrend}
        quoteDistribution={snapshot.charts.quoteDistribution}
        orderDistribution={snapshot.charts.orderDistribution}
      />

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="surface-card border border-white/70 p-6">
          <h2 className="text-lg font-black text-slate-950">Son 10 siparis</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentOrders.length > 0 ? (
              snapshot.activity.recentOrders.map((order) => (
                <AdminPrefetchLink
                  key={order.id}
                  href={`/admin/siparisler/${order.id}`}
                  className="block rounded-2xl bg-white/70 px-4 py-3 transition hover:bg-emerald-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-slate-950">{order.orderNumber}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {order.customerName || "Misafir musteri"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-950">
                        {formatPriceTRY(order.totalKurus)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {orderStatusLabels[order.status] ?? order.status}
                      </p>
                    </div>
                  </div>
                </AdminPrefetchLink>
              ))
            ) : (
              <EmptyState label="Henuz siparis hareketi yok." />
            )}
          </div>
        </div>

        <div className="surface-card border border-white/70 p-6">
          <h2 className="text-lg font-black text-slate-950">Son 5 teklif</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentQuotes.length > 0 ? (
              snapshot.activity.recentQuotes.map((quote) => (
                <AdminPrefetchLink
                  key={quote.id}
                  href={`/admin/teklifler/${quote.id}`}
                  className="block rounded-2xl bg-white/70 px-4 py-3 transition hover:bg-emerald-50"
                >
                  <p className="text-sm font-black text-slate-950">{quote.fullName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {quote.companyName || "Bireysel talep"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {quoteStatusLabels[quote.status] ?? quote.status}
                  </p>
                </AdminPrefetchLink>
              ))
            ) : (
              <EmptyState label="Henuz teklif hareketi yok." />
            )}
          </div>
        </div>

        <div className="surface-card border border-white/70 p-6">
          <h2 className="text-lg font-black text-slate-950">Son saha talepleri</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentServiceRequests.length > 0 ? (
              snapshot.activity.recentServiceRequests.map((item) => (
                <AdminPrefetchLink
                  key={item.id}
                  href={`/admin/saha/${item.id}`}
                  className="block rounded-2xl bg-white/70 px-4 py-3 transition hover:bg-emerald-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-950">{item.fullName}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.leadType}</p>
                    </div>
                    <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {leadStatusLabels[item.status] ?? item.status} - {formatDate(item.createdAt)}
                  </p>
                </AdminPrefetchLink>
              ))
            ) : (
              <EmptyState label="Henuz saha talebi yok." />
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="surface-card border border-white/70 bg-[#063326] p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-200">
                Risk radari
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                Kritik kontrolleri her gun kapatin.
              </h2>
            </div>
            <AlertTriangle className="h-6 w-6 text-amber-200" />
          </div>
          <div className="mt-5 grid gap-3">
            {marketPanelInsights.map((insight) => (
              <div key={insight.label} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
                <p className="text-sm font-black">{insight.label}</p>
                <p className="mt-2 text-xs leading-5 text-white/68">{insight.detail}</p>
                <p className="mt-3 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200">
                  {insight.source}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card border border-white/70 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#0f8f6f]">
                Operasyon checklist
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
                Satis, saha, icerik ve guvenlik kapanislari.
              </h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-[#063326]">
              Gunluk rutin
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {adminOpsChecklist.map((item, index) => (
              <AdminPrefetchLink
                key={item.label}
                href={item.href}
                className="group rounded-3xl border border-slate-200 bg-white/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-emerald-100 text-sm font-black text-[#063326]">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm font-black text-slate-950">{item.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#063326]">
                  Modulu ac
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </AdminPrefetchLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
