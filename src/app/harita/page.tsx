import type { Metadata } from "next";

import { stations } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Harita",
  description:
    "Yakındaki şarj istasyonlarını bulun, soket türlerini inceleyin ve yol tarifi alın."
};

export default function MapPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[0.38fr_0.62fr] lg:px-8">
      <section className="surface-card p-6">
        <h1 className="text-4xl font-black tracking-[-0.08em] text-on-surface">
          İstasyon Bul
        </h1>
        <div className="mt-6 rounded-[22px] bg-surface-container-low px-4 py-4 text-on-surface-variant">
          Şehir, ilçe veya istasyon adı arayın...
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white">
            Süper Hızlı (&gt;150kW)
          </span>
          <span className="rounded-full bg-surface-container-high px-4 py-3 text-sm font-semibold text-on-surface">
            Müsait
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {stations.map((station, index) => (
            <article
              key={station.id}
              className={`rounded-[24px] border p-5 ${
                index === 0
                  ? "border-primary bg-surface-container-low"
                  : "border-outline-variant/35 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.05em] text-on-surface">
                    {station.name}
                  </h2>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {station.distance} uzaklıkta
                  </p>
                </div>
                <span className="rounded-full bg-secondary-container px-3 py-2 text-sm font-semibold text-secondary">
                  {station.status}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-on-surface">
                <span className="font-semibold">{station.power}</span>
                {station.connectorTypes.map((connector) => (
                  <span
                    key={connector}
                    className="rounded-xl bg-surface-container px-3 py-2 text-on-surface-variant"
                  >
                    {connector}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-white to-secondary/10" />
        <div className="relative h-full min-h-[760px] overflow-hidden rounded-[28px] bg-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,68,211,0.16),transparent_28%),radial-gradient(circle_at_68%_38%,rgba(0,110,47,0.14),transparent_24%),linear-gradient(120deg,#f6f7ff_10%,#eceffd_60%,#f7fbff_100%)]" />
          <div className="absolute left-[42%] top-[28%] flex h-20 w-20 items-center justify-center rounded-full border-8 border-white bg-primary text-3xl font-black text-white shadow-[0_20px_60px_rgba(0,68,211,0.3)]">
            ⚡
          </div>
          <div className="absolute bottom-8 left-8 right-8 rounded-[30px] bg-white/85 p-6 shadow-[0_24px_60px_rgba(19,27,46,0.14)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Ultra hızlı şarj
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] text-on-surface">
              Zorlu Center Şarj Noktası
            </h2>
            <div className="mt-6 flex items-center justify-between gap-4">
              <span className="text-xl font-bold text-secondary">3 soket müsait</span>
              <span className="text-lg font-semibold text-on-surface">
                7.45 ₺ / kWh
              </span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] border border-outline-variant/35 bg-surface-container-low p-4">
                <p className="text-sm font-medium text-on-surface-variant">CCS2 (180kW)</p>
                <p className="mt-2 text-2xl font-bold text-primary">Müsait</p>
              </div>
              <div className="rounded-[22px] border border-outline-variant/35 bg-surface-container-low p-4">
                <p className="text-sm font-medium text-on-surface-variant">Type 2 (22kW)</p>
                <p className="mt-2 text-2xl font-bold text-on-surface-variant">
                  Kullanımda
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

