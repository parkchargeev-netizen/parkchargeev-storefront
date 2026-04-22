import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { formatPriceTRY } from "@/lib/format";
import { hasDatabaseConfig } from "@/lib/runtime-config";
import { getAdminDashboardSnapshot } from "@/server/admin/repository";

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

export default async function AdminDashboardPage() {
  if (!hasDatabaseConfig()) {
    return (
      <div className="space-y-6">
        <section className="surface-card border border-slate-200 bg-white/95 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">
            Kurulum Bekleniyor
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">
            Admin oturumu aktif, veritabani henuz bagli degil
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Bu gecici modda admin paneline giris yapabilirsiniz. Siparis, urun, teklif ve dashboard
            verileri icin production ortaminda gecerli bir DATABASE_URL tanimlanmasi gerekiyor.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="surface-card border border-amber-200 bg-amber-50/80 p-6">
            <h2 className="text-lg font-semibold text-slate-950">Aktif olanlar</h2>
            <p className="mt-3 text-sm text-slate-700">
              Admin girisi, oturum yonetimi ve panel kabugu Vercel uzerinde kullanima hazir.
            </p>
          </div>

          <div className="surface-card border border-slate-200 bg-white/95 p-6">
            <h2 className="text-lg font-semibold text-slate-950">Siradaki adim</h2>
            <p className="mt-3 text-sm text-slate-700">
              DATABASE_URL eklendikten sonra tam panel verileri otomatik olarak aktif hale gelecek.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const snapshot = await getAdminDashboardSnapshot();

  return (
    <div className="space-y-6">
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
          <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Aylik hedef ilerleme</p>
            <p className="mt-2 text-3xl font-semibold">
              %{snapshot.kpis.targetProgress.toFixed(1)}
            </p>
          </div>
        </div>
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
              <div key={order.id} className="rounded-2xl bg-slate-50 px-4 py-3">
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
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Son 5 Teklif</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentQuotes.map((quote) => (
              <div key={quote.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{quote.fullName}</p>
                <p className="text-sm text-slate-600">{quote.companyName || "Bireysel talep"}</p>
                <p className="mt-2 text-xs text-slate-500">{quote.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Son 3 Servis Talebi</h2>
          <div className="mt-5 space-y-3">
            {snapshot.activity.recentServiceRequests.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{item.fullName}</p>
                <p className="text-sm text-slate-600">{item.leadType}</p>
                <p className="mt-2 text-xs text-slate-500">{item.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
