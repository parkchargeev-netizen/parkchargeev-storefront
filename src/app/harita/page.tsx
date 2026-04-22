import type { Metadata } from "next";
import Link from "next/link";

import { stations } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Harita",
  description:
    "Yakındaki şarj istasyonlarını bulun, soket türlerini inceleyin ve yol tarifi alın."
};

type MapPageProps = {
  searchParams: Promise<{
    available?: string;
    q?: string;
  }>;
};

function buildMapHref({ q, available }: { q?: string; available?: string }) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (available === "1") {
    params.set("available", "1");
  }

  const query = params.toString();
  return query ? `/harita?${query}` : "/harita";
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const normalizedQuery = query.toLocaleLowerCase("tr-TR");
  const onlyAvailable = params.available === "1";

  const filteredStations = stations.filter((station) => {
    const matchesAvailability = !onlyAvailable || station.status.includes("müsait");
    const matchesSearch = normalizedQuery
      ? `${station.name} ${station.city} ${station.connectorTypes.join(" ")} ${station.power}`
          .toLocaleLowerCase("tr-TR")
          .includes(normalizedQuery)
      : true;

    return matchesAvailability && matchesSearch;
  });

  const highlightedStation = filteredStations[0] ?? null;

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[0.38fr_0.62fr] lg:px-8">
      <section className="surface-card p-6">
        <h1 className="text-4xl font-black tracking-[-0.08em] text-on-surface">
          İstasyon Bul
        </h1>
        <form action="/harita" className="mt-6 grid gap-4">
          <input
            name="q"
            defaultValue={query}
            placeholder="Şehir, ilçe veya istasyon adı arayın..."
            className="rounded-[22px] border border-outline-variant/45 bg-white px-4 py-4 text-on-surface outline-none transition focus:border-primary"
          />
          {onlyAvailable ? <input type="hidden" name="available" value="1" /> : null}
          <button
            type="submit"
            className="rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white"
          >
            İstasyon Ara
          </button>
        </form>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={buildMapHref({
              q: query || undefined,
              available: onlyAvailable ? undefined : "1"
            })}
            className={`rounded-full px-4 py-3 text-sm font-semibold ${
              onlyAvailable
                ? "bg-primary text-white"
                : "bg-surface-container-high text-on-surface"
            }`}
          >
            Sadece müsait
          </Link>
          <Link
            href={buildMapHref({ q: query || undefined })}
            className="rounded-full bg-surface-container-high px-4 py-3 text-sm font-semibold text-on-surface"
          >
            Tüm istasyonlar
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {filteredStations.length === 0 ? (
            <div className="rounded-[24px] border border-outline-variant/35 bg-white p-5">
              <h2 className="text-2xl font-bold tracking-[-0.05em] text-on-surface">
                Sonuç bulunamadı
              </h2>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Aramanızı genişletin veya müsait filtresini kaldırın.
              </p>
            </div>
          ) : (
            filteredStations.map((station, index) => (
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
                      {station.distance} uzaklıkta · {station.city}
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
            ))
          )}
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
            {highlightedStation ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                  {highlightedStation.power}
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] text-on-surface">
                  {highlightedStation.name}
                </h2>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className="text-xl font-bold text-secondary">
                    {highlightedStation.status}
                  </span>
                  <span className="text-lg font-semibold text-on-surface">
                    {highlightedStation.pricePerKwh}
                  </span>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {highlightedStation.connectorTypes.map((connector) => (
                    <div
                      key={connector}
                      className="rounded-[22px] border border-outline-variant/35 bg-surface-container-low p-4"
                    >
                      <p className="text-sm font-medium text-on-surface-variant">
                        {connector}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-primary">
                        {highlightedStation.status}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-[24px] bg-white/80 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                  Sonuç yok
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-on-surface">
                  Uygun istasyon bulunamadı
                </h2>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  Arama terimini genişletin veya “Sadece müsait” filtresini kapatıp yeniden deneyin.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
