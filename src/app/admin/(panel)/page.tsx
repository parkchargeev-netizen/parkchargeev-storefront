import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  ShoppingCart,
  Target,
  Users,
  Wrench,
  Zap
} from "lucide-react";

import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { formatPriceTRY } from "@/lib/format";
import { hasDatabaseConfig } from "@/lib/runtime-config";
import {
  leadStatusOptions,
  orderStatusOptions,
  quoteStatusOptions
} from "@/server/admin/constants";
import { getAdminDashboardSnapshot } from "@/server/admin/repository";
import { requireAdminRole } from "@/server/auth/guards";
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
    <Link
      href={href}
      prefetch={false}
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
    </Link>
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
    label: "Siparis kuyrugu",
    detail: "Odeme ve onay bekleyen kayitlar",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/teklifler",
    label: "Teklif pipeline",
    detail: "Yeni, inceleme ve muzakere talepleri",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/site",
    label: "Site yonetimi",
    detail: "Menu, landing sayfalari ve public icerik",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/audit",
    label: "Audit ve guvenlik",
    detail: "Islem gecmisi ve admin oturum denetimi",
    roles: ["superadmin"]
  }
];

const adminStandards = [
  {
    label: "Aksiyon odakli kuyruk",
    detail: "Siparis, teklif ve saha talepleri siradaki is olarak ayrildi.",
    status: "Aktif"
  },
  {
    label: "Rol bazli erisim",
    detail: "Moduller role gore filtreleniyor ve middleware seviyesinde korunuyor.",
    status: "Aktif"
  },
  {
    label: "Oturum guvenligi",
    detail: "Cikis butonu, no-store basliklari ve hareketsizlik uyarisi var.",
    status: "Aktif"
  },
  {
    label: "Erisilebilir tablolar",
    detail: "Siralanabilir listeler ve CSV cikislari operasyon gorunumlerinde kullaniliyor.",
    status: "Aktif"
  }
] as const;

export default async function AdminDashboardPage() {
  const [snapshot, authenticatedAdmin] = await Promise.all([
    getAdminDashboardSnapshot(),
    requireAdminRole()
  ]);
  const databaseEnabled = hasDatabaseConfig();
  const role = authenticatedAdmin?.session.role;
  const visibleQuickActions = role
    ? quickActions.filter((action) => action.roles.includes(role))
    : [];
  const paytrReady = Boolean(
    process.env.PAYTR_MERCHANT_ID?.trim() &&
      process.env.PAYTR_MERCHANT_KEY?.trim() &&
      process.env.PAYTR_MERCHANT_SALT?.trim()
  );
  const openQueueTotal =
    snapshot.kpis.pendingOrders +
    snapshot.kpis.pendingQuotes +
    snapshot.kpis.openServiceRequests;
  const securityHref = role === "superadmin" ? "/admin/adminler" : "/admin/erisim";
  const securityAction = role === "superadmin" ? "Oturumlari denetle" : "Erisim haritasi";
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
      label: "Siparis onay bekliyor",
      value: snapshot.kpis.pendingOrders,
      detail: "Odeme, stok ve teslimat kontrolu gereken kayitlar.",
      action: "Siparisleri incele",
      icon: <ShoppingCart className="h-5 w-5" />,
      tone: snapshot.kpis.pendingOrders > 0 ? "warning" : "success",
      roles: ["superadmin", "sales"]
    },
    {
      href: "/admin/teklifler",
      label: "Teklif aksiyonu",
      value: snapshot.kpis.pendingQuotes,
      detail: "Yeni, inceleme veya muzakere asamasindaki talepler.",
      action: "Pipeline ac",
      icon: <FileText className="h-5 w-5" />,
      tone: snapshot.kpis.pendingQuotes > 0 ? "info" : "success",
      roles: ["superadmin", "sales"]
    },
    {
      href: "/admin/saha",
      label: "Saha ve servis",
      value: snapshot.kpis.openServiceRequests,
      detail: "Servis, kesif ve kurulum ekibine aktarilacak leadler.",
      action: "Saha talepleri",
      icon: <Wrench className="h-5 w-5" />,
      tone: snapshot.kpis.openServiceRequests > 0 ? "warning" : "success",
      roles: ["superadmin", "operations", "technician"]
    },
    {
      href: securityHref,
      label: "Guvenlik sinyali",
      value: snapshot.security.activeSessions,
      detail: "Aktif admin oturumlari ve son audit hareketleri.",
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

  return (
    <div className="space-y-6">
      {!databaseEnabled ? (
        <section className="surface-card border border-amber-200 bg-amber-50/80 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Yerel Fallback Modu
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-700">
            Veritabani baglantisi olmadan calisabilen yerel admin veri katmani aktif. Urun,
            siparis ve teklif aksiyonlari bu modda da kaydedilir.
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
              Bugun neye odaklanmaniz gerektigini tek bakista gosterir.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              Siparis, teklif, saha, guvenlik ve icerik sinyalleri ayni ekranda toplanir; acik
              kuyruklar ilk siraya, detayli analizler alt bolumlere iner.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Acik kuyruk
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
                  Veri modu
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {databaseEnabled ? "Canli Supabase" : "Fallback"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Aylik hedef
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
              <Link
                href="/admin/siparisler"
                prefetch={false}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Siparislere git
              </Link>
            </div>
          </div>
        </div>
      </section>

      {visibleQuickActions.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-4">
          {visibleQuickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              prefetch={false}
              className="surface-card border border-slate-200 bg-white/95 p-5 transition hover:border-blue-200 hover:bg-blue-50/70"
            >
              <p className="text-sm font-semibold text-slate-950">{action.label}</p>
              <p className="mt-2 text-xs leading-5 text-slate-600">{action.detail}</p>
            </Link>
          ))}
        </section>
      ) : null}

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
          label="Bugunku ciro"
          value={formatPriceTRY(snapshot.kpis.todayRevenue)}
          detail="Bugun olusan onayli siparis toplami"
          icon={<Zap className="h-5 w-5" />}
          tone="success"
        />
        <MetricCard
          label="Bu ayki ciro"
          value={formatPriceTRY(snapshot.kpis.monthRevenue)}
          detail="Aylik hedef karsilasmasi icin ana gosterge"
          icon={<Gauge className="h-5 w-5" />}
          tone={targetTone}
        />
        <MetricCard
          label="Bu hafta tamamlanan"
          value={String(snapshot.kpis.completedInstallations)}
          detail="Teslim edildi veya tamamlandi durumuna gecen kayitlar"
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <MetricCard
          label="Son 7 gun yeni musteri"
          value={String(snapshot.kpis.newCustomers)}
          detail="Kayit olan kullanici sayisi"
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
                Sistem ve Risk Radari
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Kritik admin kontrolleri
              </h2>
            </div>
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <HealthItem
              label="Veri baglantisi"
              detail="Admin listeleri ve KPI kartlari canli veri kaynagina bagli."
              status={databaseEnabled ? "Canli" : "Fallback"}
              tone={databaseEnabled ? "success" : "warning"}
            />
            <HealthItem
              label="PayTR konfigurasyonu"
              detail="Odeme operasyonu icin merchant anahtarlari kontrol edildi."
              status={paytrReady ? "Hazir" : "Eksik"}
              tone={paytrReady ? "success" : "danger"}
            />
            <HealthItem
              label="Oturum politikasi"
              detail="No-store, noindex, gorunur cikis ve hareketsizlik uyarisi etkin."
              status="Aktif"
              tone="success"
            />
            <HealthItem
              label="Yetki modeli"
              detail="Rol bazli moduller middleware ve shell seviyesinde eslesiyor."
              status="Korumali"
              tone="success"
            />
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                Audit
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
                    {log.summary ?? "Audit ozeti yok"}
                  </p>
                </div>
              ))
            ) : (
              <EmptyActivity label="Henuz audit hareketi yok." />
            )}
          </div>
        </div>
      </section>

      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Admin Standartlari
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Ust duzey panel kontrol listesi
            </h2>
          </div>
          <Link
            href="/admin/erisim"
            prefetch={false}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Tum admin kisayollari
          </Link>
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
          <h2 className="text-lg font-semibold text-slate-950">Son 10 Siparis</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentOrders.length > 0 ? (
              snapshot.activity.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/siparisler/${order.id}`}
                  prefetch={false}
                  className="block rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-blue-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{order.orderNumber}</p>
                      <p className="text-sm text-slate-600">
                        {order.customerName || "Misafir musteri"}
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
                </Link>
              ))
            ) : (
              <EmptyActivity label="Henuz siparis hareketi yok." />
            )}
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Son 5 Teklif</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentQuotes.length > 0 ? (
              snapshot.activity.recentQuotes.map((quote) => (
                <Link
                  key={quote.id}
                  href={`/admin/teklifler/${quote.id}`}
                  prefetch={false}
                  className="block rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-blue-50"
                >
                  <p className="text-sm font-semibold text-slate-900">{quote.fullName}</p>
                  <p className="text-sm text-slate-600">
                    {quote.companyName || "Bireysel talep"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {labelFor(quoteStatusOptions, quote.status)}
                  </p>
                </Link>
              ))
            ) : (
              <EmptyActivity label="Henuz teklif hareketi yok." />
            )}
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Son 3 Servis Talebi</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentServiceRequests.length > 0 ? (
              snapshot.activity.recentServiceRequests.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/saha/${item.id}`}
                  prefetch={false}
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
                </Link>
              ))
            ) : (
              <EmptyActivity label="Henuz servis talebi yok." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
