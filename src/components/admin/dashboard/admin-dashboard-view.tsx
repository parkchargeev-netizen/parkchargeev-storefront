import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Cable,
  CheckCircle2,
  Clock3,
  FileText,
  Gauge,
  Home,
  LockKeyhole,
  MapPin,
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
import { serviceCoverageSummary } from "@/lib/service-coverage";
import {
  leadStatusOptions,
  orderStatusOptions,
  quoteStatusOptions
} from "@/server/admin/constants";
import type { AdminDashboardSnapshot } from "@/server/admin/dashboard";
import type { AdminRole } from "@/server/auth/authorization";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

function toneClass(tone: Tone) {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "danger":
      return "border-red-200 bg-red-50 text-red-800";
    case "info":
      return "border-blue-200 bg-blue-50 text-blue-800";
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
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function labelFor(
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>,
  value: string
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function MetricCard({
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
    <div className="surface-card border border-slate-200 bg-white/95 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
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
      className="surface-card group flex h-full flex-col justify-between border border-slate-200 bg-white/95 p-5 transition hover:border-blue-200 hover:bg-blue-50/60"
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`rounded-2xl p-2 ${iconToneClass(tone)}`}>{icon}</span>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClass(tone)}`}>
          {value > 0 ? "Aksiyon var" : "Temiz"}
        </span>
      </div>
      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="mt-2 text-4xl font-semibold text-slate-950">{value}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
        {action}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </AdminPrefetchLink>
  );
}

function HealthItem({
  label,
  detail,
  status,
  tone
}: {
  label: string;
  detail: string;
  status: string;
  tone: Tone;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClass(tone)}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function EmptyActivity({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}

const quickActions: Array<{
  href: string;
  label: string;
  detail: string;
  roles: AdminRole[];
}> = [
  {
    href: "/admin/siparisler",
    label: "Sipariş kuyruğu",
    detail: "Ödeme ve onay bekleyen kayıtlar",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/teklifler",
    label: "Teklif akışı",
    detail: "Yeni, inceleme ve müzakere talepleri",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/site",
    label: "Site yönetimi",
    detail: "Menü, açılış sayfaları ve yayındaki içerik",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/audit",
    label: "Denetim ve güvenlik",
    detail: "İşlem geçmişi ve admin oturum denetimi",
    roles: ["superadmin"]
  }
];

const adminStandards = [
  {
    label: "Aksiyon odaklı kuyruk",
    detail: "Sipariş, teklif ve saha talepleri sıradaki iş olarak ayrıldı.",
    status: "Aktif"
  },
  {
    label: "Rol bazlı erişim",
    detail: "Modüller role göre filtreleniyor ve middleware seviyesinde korunuyor.",
    status: "Aktif"
  },
  {
    label: "Oturum güvenliği",
    detail: "Çıkış butonu, no-store başlıkları ve hareketsizlik uyarısı var.",
    status: "Aktif"
  },
  {
    label: "Erişilebilir tablolar",
    detail: "Sıralanabilir listeler ve CSV çıkışları operasyon görünümlerinde kullanılıyor.",
    status: "Aktif"
  }
] as const;

const personaOperationCards: Array<{
  href: string;
  label: string;
  detail: string;
  signal: string;
  icon: ReactNode;
  tone: Tone;
}> = [
  {
    href: "/admin/teklifler",
    label: "Ev tipi AC alıcısı",
    detail: "Sakarya ücretsiz keşif, 7.4/11 kW wallbox ve kurulum uygunluğu.",
    signal: "En hızlı dönüşüm",
    icon: <Home className="h-5 w-5" />,
    tone: "success"
  },
  {
    href: "/admin/teklifler",
    label: "Site / apartman",
    detail: "RFID, ortak kullanım, yönetim onayı ve teknik teklif paketi.",
    signal: "Yönetim kararı",
    icon: <Building2 className="h-5 w-5" />,
    tone: "info"
  },
  {
    href: "/admin/teklifler",
    label: "KOBİ / ofis",
    detail: "22 kW AC, çalışan/misafir deneyimi ve servis planı.",
    signal: "Kurumsal teklif",
    icon: <Users className="h-5 w-5" />,
    tone: "warning"
  },
  {
    href: "/admin/saha",
    label: "Ticari lokasyon",
    detail: "DC/çoklu AC saha, enerji kapasitesi ve fizibilite ön kontrolü.",
    signal: "Fizibilite",
    icon: <MapPin className="h-5 w-5" />,
    tone: "danger"
  },
  {
    href: "/admin/urunler",
    label: "Kablo / aksesuar",
    detail: "Type 2 uyum, stok görünürlüğü ve hızlı sepet dönüşümü.",
    signal: "Hızlı satış",
    icon: <Cable className="h-5 w-5" />,
    tone: "neutral"
  }
];

type AdminDashboardViewProps = {
  snapshot: AdminDashboardSnapshot;
  role?: AdminRole;
  databaseEnabled: boolean;
  paytrReady: boolean;
};

export function AdminDashboardView({
  snapshot,
  role,
  databaseEnabled,
  paytrReady
}: AdminDashboardViewProps) {
  const visibleQuickActions = role
    ? quickActions.filter((action) => action.roles.includes(role))
    : [];
  const openQueueTotal =
    snapshot.kpis.pendingOrders +
    snapshot.kpis.pendingQuotes +
    snapshot.kpis.openServiceRequests;
  const securityHref = role === "superadmin" ? "/admin/adminler" : "/admin/erisim";
  const securityAction = role === "superadmin" ? "Oturumları denetle" : "Erişim haritası";
  const queueCards: Array<{
    href: string;
    label: string;
    value: number;
    detail: string;
    action: string;
    icon: ReactNode;
    tone: Tone;
    roles: AdminRole[];
  }> = [
    {
      href: "/admin/siparisler?status=pending_confirmation",
      label: "Sipariş onay bekliyor",
      value: snapshot.kpis.pendingOrders,
      detail: "Ödeme, stok ve teslimat kontrolü gereken kayıtlar.",
      action: "Siparişleri incele",
      icon: <ShoppingCart className="h-5 w-5" />,
      tone: snapshot.kpis.pendingOrders > 0 ? "warning" : "success",
      roles: ["superadmin", "sales"]
    },
    {
      href: "/admin/teklifler",
      label: "Teklif aksiyonu",
      value: snapshot.kpis.pendingQuotes,
      detail: "Yeni, inceleme veya muzakere aşamasındaki talepler.",
      action: "Akışı aç",
      icon: <FileText className="h-5 w-5" />,
      tone: snapshot.kpis.pendingQuotes > 0 ? "info" : "success",
      roles: ["superadmin", "sales"]
    },
    {
      href: "/admin/saha",
      label: "Saha ve servis",
      value: snapshot.kpis.openServiceRequests,
      detail: "Servis, keşif ve kurulum ekibine aktarılacak talepler.",
      action: "Saha talepleri",
      icon: <Wrench className="h-5 w-5" />,
      tone: snapshot.kpis.openServiceRequests > 0 ? "warning" : "success",
      roles: ["superadmin", "operations", "technician"]
    },
    {
      href: securityHref,
      label: "Güvenlik sinyali",
      value: snapshot.security.activeSessions,
      detail: "Aktif admin oturumları ve son denetim hareketleri.",
      action: securityAction,
      icon: <ShieldCheck className="h-5 w-5" />,
      tone: snapshot.security.activeSessions > 1 ? "info" : "neutral",
      roles: ["superadmin", "sales", "operations", "technician", "editor"]
    }
  ];
  const visibleQueueCards = queueCards.filter((card) => (role ? card.roles.includes(role) : false));
  const targetTone: Tone =
    snapshot.kpis.targetProgress >= 85
      ? "success"
      : snapshot.kpis.targetProgress >= 45
        ? "info"
        : "warning";
  const todayActions = [
    {
      label: "Ödeme ve sipariş onayı",
      count: snapshot.kpis.pendingOrders,
      href: "/admin/siparisler?status=pending_confirmation",
      detail: "Ödeme, stok ve teslimat kontrolü bekleyen siparişler."
    },
    {
      label: "Teklif dönüşü",
      count: snapshot.kpis.pendingQuotes,
      href: "/admin/teklifler",
      detail: "Yeni veya müzakere aşamasındaki satış fırsatları."
    },
    {
      label: "Saha planlama",
      count: snapshot.kpis.openServiceRequests,
      href: "/admin/saha",
      detail: "Keşif, servis veya kurulum ekibine aktarılacak kayıtlar."
    }
  ].filter((action) => action.count > 0);

  return (
    <div className="space-y-6">
      {!databaseEnabled ? (
        <section className="surface-card border border-amber-200 bg-amber-50/80 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Yerel Yedek Mod
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-700">
            Veritabanı bağlantısı olmadan çalışabilen yerel admin veri katmanı aktif. Ürün,
            sipariş ve teklif aksiyonları bu modda da kaydedilir.
          </p>
        </section>
      ) : null}

      <section className="surface-card overflow-hidden border border-slate-200 bg-white/95 p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)] xl:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Operasyon Komuta Paneli
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-slate-950 lg:text-4xl">
              Sakarya ve Kocaeli satış, keşif ve kurulum masası.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              Sipariş, teklif, saha, güvenlik ve içerik sinyalleri aynı ekranda toplanır; persona bazlı fırsatlar açık kuyruklarla birlikte önceliklendirilir.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Açık kuyruk
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{openQueueTotal}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Aktif oturum
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {snapshot.security.activeSessions}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Kapsam
                </p>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-950">
                  {serviceCoverageSummary.shipping}
                  <br />
                  {serviceCoverageSummary.freeSurvey}
                  <br />
                  {serviceCoverageSummary.installation}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Aylık hedef
                </p>
                <p className="mt-2 text-4xl font-semibold">
                  %{snapshot.kpis.targetProgress.toFixed(1)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-blue-300"
                style={{ width: `${Math.min(snapshot.kpis.targetProgress, 100)}%` }}
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClass(targetTone)}`}>
                Hedef sinyali
              </span>
              <AdminPrefetchLink
                href="/admin/siparisler"
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Siparişlere git
              </AdminPrefetchLink>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="surface-card border border-slate-200 bg-slate-950 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">
            Saha Kapsamı
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight">
            Keşif ve kurulum taleplerini şehir kuralına göre ayırın.
          </h2>
          <div className="mt-5 grid gap-3">
            {[
              serviceCoverageSummary.shipping,
              serviceCoverageSummary.freeSurvey,
              serviceCoverageSummary.installation
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3">
                <p className="text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-white/64">
            Kocaeli taleplerini kurulum kapsamına alın; ücretsiz keşif etiketini yalnızca Sakarya kayıtlarında kullanın.
          </p>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                Persona Satış Masası
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Her talep doğru operasyon yoluna düşsün.
              </h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {personaOperationCards.map((item) => (
              <AdminPrefetchLink
                key={item.label}
                href={item.href}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`rounded-2xl p-2 ${iconToneClass(item.tone)}`}>{item.icon}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-700" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-950">{item.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
                <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${toneClass(item.tone)}`}>
                  {item.signal}
                </span>
              </AdminPrefetchLink>
            ))}
          </div>
        </div>
      </section>

      {visibleQuickActions.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-4">
          {visibleQuickActions.map((action) => (
            <AdminPrefetchLink
              key={action.href}
              href={action.href}
              className="surface-card border border-slate-200 bg-white/95 p-5 transition hover:border-blue-200 hover:bg-blue-50/70"
            >
              <p className="text-sm font-semibold text-slate-950">{action.label}</p>
              <p className="mt-2 text-xs leading-5 text-slate-600">{action.detail}</p>
            </AdminPrefetchLink>
          ))}
        </section>
      ) : null}

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Bugünün Aksiyonları
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Öncelikli operasyon masası
            </h2>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {(todayActions.length > 0
            ? todayActions
            : [
                {
                  label: "Açık kritik kuyruk yok",
                  count: 0,
                  href: "/admin/audit",
                  detail: "Yeni talep geldiğinde bu alan otomatik öncelik sırasına göre dolacak."
                }
              ]
          ).map((action) => (
            <AdminPrefetchLink
              key={action.label}
              href={action.href}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <p className="text-sm font-semibold text-slate-950">{action.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{action.count}</p>
              <p className="mt-2 text-xs leading-5 text-slate-600">{action.detail}</p>
            </AdminPrefetchLink>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {visibleQueueCards.map((card) => (
          <QueueCard
            key={card.label}
            href={card.href}
            label={card.label}
            value={card.value}
            detail={card.detail}
            action={card.action}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Bugünkü ciro"
          value={formatPriceTRY(snapshot.kpis.todayRevenue)}
          detail="Bugün oluşan onaylı sipariş toplamı"
          icon={<Zap className="h-5 w-5" />}
          tone="success"
        />
        <MetricCard
          label="Bu ayki ciro"
          value={formatPriceTRY(snapshot.kpis.monthRevenue)}
          detail="Aylık hedef karşılaştırması için ana gösterge"
          icon={<Gauge className="h-5 w-5" />}
          tone={targetTone}
        />
        <MetricCard
          label="Bu hafta tamamlanan"
          value={String(snapshot.kpis.completedInstallations)}
          detail="Teslim edildi veya tamamlandı durumuna geçen kayıtlar"
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <MetricCard
          label="Son 7 gün yeni müşteri"
          value={String(snapshot.kpis.newCustomers)}
          detail="Kayıt olan kullanıcı sayısı"
          icon={<Users className="h-5 w-5" />}
          tone="info"
        />
      </section>

      <DashboardCharts
        revenueTrend={snapshot.charts.revenueTrend}
        quoteDistribution={snapshot.charts.quoteDistribution}
        orderDistribution={snapshot.charts.orderDistribution}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                Sistem ve Risk Radarı
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Kritik admin kontrolleri
              </h2>
            </div>
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <HealthItem
              label="Veri bağlantısı"
              detail="Admin listeleri ve KPI kartları canlı veri kaynağına bağlı."
              status={databaseEnabled ? "Canlı" : "Yerel yedek"}
              tone={databaseEnabled ? "success" : "warning"}
            />
            <HealthItem
              label="PayTR konfigürasyonu"
              detail="Ödeme operasyonu için merchant anahtarları kontrol edildi."
              status={paytrReady ? "Hazır" : "Eksik"}
              tone={paytrReady ? "success" : "danger"}
            />
            <HealthItem
              label="Oturum politikası"
              detail="No-store, noindex, görünür çıkış ve hareketsizlik uyarısı etkin."
              status="Aktif"
              tone="success"
            />
            <HealthItem
              label="Yetki modeli"
              detail="Rol bazlı modüller middleware ve shell seviyesinde eşleşiyor."
              status="Korumalı"
              tone="success"
            />
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                Denetim
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Son hareketler</h2>
            </div>
            <LockKeyhole className="h-6 w-6 text-slate-400" />
          </div>
          <div className="mt-5 space-y-3">
            {snapshot.security.recentAuditLogs.length > 0 ? (
              snapshot.security.recentAuditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{log.action}</p>
                    <span className="text-xs text-slate-500">{formatDate(log.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{log.entityType}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {log.summary ?? "Denetim özeti yok"}
                  </p>
                </div>
              ))
            ) : (
              <EmptyActivity label="Henüz denetim hareketi yok." />
            )}
          </div>
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Admin Standartları
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Üst düzey panel kontrol listesi
            </h2>
          </div>
          <AdminPrefetchLink
            href="/admin/erisim"
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Tüm admin kısayolları
          </AdminPrefetchLink>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {adminStandards.map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {item.status}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Son 10 Sipariş</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentOrders.length > 0 ? (
              snapshot.activity.recentOrders.map((order) => (
                <AdminPrefetchLink
                  key={order.id}
                  href={`/admin/siparisler/${order.id}`}
                  className="block rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-blue-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{order.orderNumber}</p>
                      <p className="text-sm text-slate-600">
                        {order.customerName || "Misafir müşteri"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatPriceTRY(order.totalKurus)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {labelFor(orderStatusOptions, order.status)}
                      </p>
                    </div>
                  </div>
                </AdminPrefetchLink>
              ))
            ) : (
              <EmptyActivity label="Henüz sipariş hareketi yok." />
            )}
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Son 5 Teklif</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentQuotes.length > 0 ? (
              snapshot.activity.recentQuotes.map((quote) => (
                <AdminPrefetchLink
                  key={quote.id}
                  href={`/admin/teklifler/${quote.id}`}
                  className="block rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-blue-50"
                >
                  <p className="text-sm font-semibold text-slate-900">{quote.fullName}</p>
                  <p className="text-sm text-slate-600">
                    {quote.companyName || "Bireysel talep"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {labelFor(quoteStatusOptions, quote.status)}
                  </p>
                </AdminPrefetchLink>
              ))
            ) : (
              <EmptyActivity label="Henüz teklif hareketi yok." />
            )}
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Son 3 Servis Talebi</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentServiceRequests.length > 0 ? (
              snapshot.activity.recentServiceRequests.map((item) => (
                <AdminPrefetchLink
                  key={item.id}
                  href={`/admin/saha/${item.id}`}
                  className="block rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-blue-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.fullName}</p>
                      <p className="text-sm text-slate-600">{item.leadType}</p>
                    </div>
                    <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {labelFor(leadStatusOptions, item.status)}
                  </p>
                </AdminPrefetchLink>
              ))
            ) : (
              <EmptyActivity label="Henüz servis talebi yok." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
