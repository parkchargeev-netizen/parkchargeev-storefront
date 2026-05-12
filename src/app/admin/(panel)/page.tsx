import Link from "next/link";

import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { formatPriceTRY } from "@/lib/format";
import { hasDatabaseConfig } from "@/lib/runtime-config";
import { getAdminDashboardSnapshot } from "@/server/admin/repository";
import { requireAdminRole } from "@/server/auth/guards";
import type { AdminRole } from "@/server/auth/authorization";

function MetricCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="surface-card border border-slate-200 bg-white/95 p-6">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </div>
  );
}

const quickActions = [
  {
    href: "/admin/urunler",
    label: "Urun yonetimi",
    detail: "Liste, varyant, stok, fiyat ve medya akisi",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/katalog",
    label: "Katalog sozlukleri",
    detail: "Marka ve kategori kayitlari",
    roles: ["superadmin", "sales"]
  },
  {
    href: "/admin/blog",
    label: "Icerik ve blog",
    detail: "Blog CRUD ve editor yetkili icerik operasyonu",
    roles: ["superadmin", "editor"]
  },
  {
    href: "/admin/erisim",
    label: "Tum erisim haritasi",
    detail: "Role gore acik moduller ve CSV kisayollari",
    roles: ["superadmin", "sales", "operations", "technician", "editor"]
  }
] satisfies Array<{
  href: string;
  label: string;
  detail: string;
  roles: AdminRole[];
}>;

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

      <section className="surface-card border border-slate-200 bg-white/95 p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Faz 1 Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Gunluk operasyon ozeti</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-600">
              Siparis, teklif ve musteri hareketleri tek bakista izlenebilir. KPI kartlari su an canli veritabanindan besleniyor.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Aylik hedef ilerleme</p>
              <p className="mt-2 text-3xl font-semibold">
                %{snapshot.kpis.targetProgress.toFixed(1)}
              </p>
            </div>
            <Link
              href="/admin/erisim"
              prefetch={false}
              className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Tum admin kisayollari
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Bugunku ciro"
          value={formatPriceTRY(snapshot.kpis.todayRevenue)}
          detail="Bugun olusan onayli siparis toplami"
        />
        <MetricCard
          label="Bu ayki ciro"
          value={formatPriceTRY(snapshot.kpis.monthRevenue)}
          detail="Aylik hedef karsilasmasi icin ana gosterge"
        />
        <MetricCard
          label="Bekleyen siparis"
          value={String(snapshot.kpis.pendingOrders)}
          detail="Odeme veya onay bekleyen siparisler"
        />
        <MetricCard
          label="Bekleyen teklif"
          value={String(snapshot.kpis.pendingQuotes)}
          detail="Satis ekibinin aksiyon alacagi aktif talepler"
        />
        <MetricCard
          label="Acik servis talebi"
          value={String(snapshot.kpis.openServiceRequests)}
          detail="Servis modulu oncesi lead tablosundan derlenir"
        />
        <MetricCard
          label="Bu hafta tamamlanan"
          value={String(snapshot.kpis.completedInstallations)}
          detail="Teslim edildi veya tamamlandi durumuna gecen kayitlar"
        />
        <MetricCard
          label="Son 7 gun yeni musteri"
          value={String(snapshot.kpis.newCustomers)}
          detail="Kayit olan kullanici sayisi"
        />
      </section>

      <DashboardCharts
        revenueTrend={snapshot.charts.revenueTrend}
        quoteDistribution={snapshot.charts.quoteDistribution}
        orderDistribution={snapshot.charts.orderDistribution}
      />

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Son 10 Siparis</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/siparisler/${order.id}`} prefetch={false} className="block rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-blue-50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{order.orderNumber}</p>
                    <p className="text-sm text-slate-600">{order.customerName || "Misafir musteri"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatPriceTRY(order.totalKurus)}</p>
                    <p className="text-xs text-slate-500">{order.status}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Son 5 Teklif</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentQuotes.map((quote) => (
              <Link key={quote.id} href={`/admin/teklifler/${quote.id}`} prefetch={false} className="block rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-blue-50">
                <p className="text-sm font-semibold text-slate-900">{quote.fullName}</p>
                <p className="text-sm text-slate-600">{quote.companyName || "Bireysel talep"}</p>
                <p className="mt-2 text-xs text-slate-500">{quote.status}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Son 3 Servis Talebi</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentServiceRequests.map((item) => (
              <Link key={item.id} href={`/admin/saha/${item.id}`} prefetch={false} className="block rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-blue-50">
                <p className="text-sm font-semibold text-slate-900">{item.fullName}</p>
                <p className="text-sm text-slate-600">{item.leadType}</p>
                <p className="mt-2 text-xs text-slate-500">{item.status}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
