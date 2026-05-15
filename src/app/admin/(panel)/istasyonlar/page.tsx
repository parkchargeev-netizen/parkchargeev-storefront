import Link from "next/link";
import { MapPin, PlugZap, Search } from "lucide-react";

import { StationForm } from "@/components/admin/station-form";
import { AdminPageHeader } from "@/components/admin/table/admin-page-header";
import { hasDatabaseConfig } from "@/lib/runtime-config";
import {
  getAdminStationById,
  listAdminStations
} from "@/server/admin/stations";
import { requireAdminRole } from "@/server/auth/guards";

type AdminStationsPageProps = {
  searchParams: Promise<{
    q?: string;
    edit?: string;
  }>;
};

export default async function AdminStationsPage({ searchParams }: AdminStationsPageProps) {
  await requireAdminRole(["superadmin", "operations", "technician"]);

  const query = await searchParams;
  const [stations, selectedStation] = await Promise.all([
    listAdminStations({ q: query.q }),
    query.edit ? getAdminStationById(query.edit) : Promise.resolve(null)
  ]);
  const activeStations = stations.filter((station) => station.isActive);
  const availableSockets = stations.reduce((total, station) => total + station.availableSockets, 0);
  const totalSockets = stations.reduce((total, station) => total + station.totalSockets, 0);
  const databaseEnabled = hasDatabaseConfig();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="İstasyonlar"
        title="Şarj istasyonu yönetimi"
        description="İstasyon kayıtlarını, soket durumlarını, konum bilgilerini ve operatör notlarını yönetin."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Toplam istasyon",
            value: String(stations.length),
            icon: <MapPin className="h-5 w-5" />
          },
          {
            label: "Aktif istasyon",
            value: String(activeStations.length),
            icon: <PlugZap className="h-5 w-5" />
          },
          {
            label: "Müsait soket",
            value: `${availableSockets}/${totalSockets}`,
            icon: <Search className="h-5 w-5" />
          }
        ].map((metric) => (
          <div key={metric.label} className="surface-card border border-slate-200 bg-white/95 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{metric.value}</p>
              </div>
              <span className="rounded-2xl bg-blue-50 p-2 text-blue-700">{metric.icon}</span>
            </div>
          </div>
        ))}
      </section>

      {!databaseEnabled ? (
        <section className="surface-card border border-amber-200 bg-amber-50/80 p-5">
          <p className="text-sm font-semibold text-amber-800">Yerel yedek veri</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Veritabanı bağlantısı olmadığı için istasyonlar statik veri üzerinden gösteriliyor.
            Canlı yönetim için istasyon tablosu ve Supabase bağlantısı gerekir.
          </p>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">İstasyon listesi</h2>
              <p className="mt-1 text-sm text-slate-600">
                Şehir, ilçe, soket ve operasyon görünürlüğü tek yerden izlenir.
              </p>
            </div>
            <form action="/admin/istasyonlar" className="flex gap-2">
              <input
                name="q"
                defaultValue={query.q ?? ""}
                placeholder="Şehir, ilçe veya istasyon ara"
                className="min-w-0 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
              />
              <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                Ara
              </button>
            </form>
          </div>

          <div className="mt-5 space-y-3">
            {stations.map((station) => (
              <Link
                key={station.id}
                href={`/admin/istasyonlar?edit=${station.id}`}
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{station.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {station.city} / {station.district}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{station.address}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      station.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {station.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1">{station.power}</span>
                  <span className="rounded-full bg-white px-3 py-1">
                    {station.availableSockets}/{station.totalSockets} soket
                  </span>
                  <span className="rounded-full bg-white px-3 py-1">{station.status}</span>
                </div>
              </Link>
            ))}

            {stations.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                İstasyon bulunamadı.
              </p>
            ) : null}
          </div>
        </div>

        <div className="surface-card border border-slate-200 bg-white/95 p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              {selectedStation ? "Düzenle" : "Yeni istasyon"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {selectedStation ? selectedStation.name : "Yeni istasyon ekle"}
            </h2>
          </div>
          <StationForm station={selectedStation} />
        </div>
      </section>
    </div>
  );
}
