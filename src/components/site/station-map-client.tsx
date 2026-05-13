"use client";

import { useMemo, useState } from "react";
import {
  Clock3,
  Gauge,
  ListFilter,
  LocateFixed,
  MapPin,
  Navigation,
  PlugZap,
  Search,
  X
} from "lucide-react";

import type { StationModel } from "@/lib/mock-data";

type StationMapClientProps = {
  stations: StationModel[];
};

type StationPosition = {
  id: string;
  x: number;
  y: number;
};

function getBounds(stations: StationModel[]) {
  const latitudes = stations.map((station) => station.latitude);
  const longitudes = stations.map((station) => station.longitude);

  return {
    minLatitude: Math.min(...latitudes),
    maxLatitude: Math.max(...latitudes),
    minLongitude: Math.min(...longitudes),
    maxLongitude: Math.max(...longitudes)
  };
}

function getStationPositions(stations: StationModel[]): StationPosition[] {
  const bounds = getBounds(stations);
  const latitudeRange = bounds.maxLatitude - bounds.minLatitude || 1;
  const longitudeRange = bounds.maxLongitude - bounds.minLongitude || 1;

  return stations.map((station) => ({
    id: station.id,
    x: 8 + ((station.longitude - bounds.minLongitude) / longitudeRange) * 84,
    y: 8 + ((bounds.maxLatitude - station.latitude) / latitudeRange) * 84
  }));
}

function getStatusTone(station: StationModel) {
  if (station.status.toLocaleLowerCase("tr-TR").includes("bakım")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (station.availableSockets === 0) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function buildDirectionsUrl(station: StationModel) {
  const destination = `${station.latitude},${station.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

export function StationMapClient({ stations }: StationMapClientProps) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [connector, setConnector] = useState("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedId, setSelectedId] = useState(stations[0]?.id ?? "");

  const cities = useMemo(
    () => Array.from(new Set(stations.map((station) => station.city))).sort((a, b) => a.localeCompare(b, "tr")),
    [stations]
  );
  const connectors = useMemo(
    () =>
      Array.from(new Set(stations.flatMap((station) => station.connectorTypes))).sort((a, b) =>
        a.localeCompare(b, "tr")
      ),
    [stations]
  );
  const positions = useMemo(() => getStationPositions(stations), [stations]);
  const positionMap = useMemo(() => new Map(positions.map((position) => [position.id, position])), [positions]);

  const filteredStations = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

    return stations.filter((station) => {
      const searchable = [
        station.name,
        station.city,
        station.district,
        station.address,
        station.power,
        station.connectorTypes.join(" ")
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      const matchesSearch = normalizedSearch ? searchable.includes(normalizedSearch) : true;
      const matchesCity = city === "all" || station.city === city;
      const matchesConnector = connector === "all" || station.connectorTypes.includes(connector);
      const matchesAvailability = !onlyAvailable || station.availableSockets > 0;

      return matchesSearch && matchesCity && matchesConnector && matchesAvailability;
    });
  }, [city, connector, onlyAvailable, search, stations]);

  const selectedStation =
    filteredStations.find((station) => station.id === selectedId) ?? filteredStations[0] ?? stations[0];
  const visibleIds = new Set(filteredStations.map((station) => station.id));
  const availableSockets = filteredStations.reduce((total, station) => total + station.availableSockets, 0);
  const totalSockets = filteredStations.reduce((total, station) => total + station.totalSockets, 0);

  function resetFilters() {
    setSearch("");
    setCity("all");
    setConnector("all");
    setOnlyAvailable(false);
    setSelectedId(stations[0]?.id ?? "");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              Canlı Harita
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
              Tüm şarj istasyonları
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              ParkChargeEV ağındaki istasyonları konuma, soket tipine ve müsaitlik durumuna göre inceleyin.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-2xl font-semibold text-slate-950">{filteredStations.length}</p>
                <p className="mt-1 text-xs text-slate-500">istasyon</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3">
                <p className="text-2xl font-semibold text-emerald-700">{availableSockets}</p>
                <p className="mt-1 text-xs text-emerald-700">müsait</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3">
                <p className="text-2xl font-semibold text-blue-700">{totalSockets}</p>
                <p className="mt-1 text-xs text-blue-700">soket</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ListFilter className="h-4 w-4" />
              Filtreler
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Arama
              </span>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Şehir, ilçe, istasyon veya soket ara"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
                />
              </div>
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <label>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Şehir
                </span>
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                >
                  <option value="all">Tüm şehirler</option>
                  {cities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Soket
                </span>
                <select
                  value={connector}
                  onChange={(event) => setConnector(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                >
                  <option value="all">Tüm soketler</option>
                  {connectors.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setOnlyAvailable((value) => !value)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  onlyAvailable ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <PlugZap className="h-4 w-4" />
                Sadece müsait
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Sıfırla
              </button>
            </div>
          </div>

          <div className="max-h-[560px] space-y-3 overflow-auto pr-1">
            {filteredStations.length > 0 ? (
              filteredStations.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => setSelectedId(station.id)}
                  className={`w-full rounded-[24px] border bg-white p-4 text-left shadow-[0_14px_44px_rgba(15,23,42,0.06)] transition hover:border-blue-200 ${
                    selectedStation?.id === station.id ? "border-blue-500 ring-4 ring-blue-50" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-950">{station.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {station.district}, {station.city}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusTone(station)}`}>
                      {station.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{station.power}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">
                      {station.availableSockets}/{station.totalSockets} soket
                    </span>
                    {station.connectorTypes.map((item) => (
                      <span key={item} className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600">
                Bu filtrelerle istasyon bulunamadı. Arama terimini genişletin veya filtreleri sıfırlayın.
              </div>
            )}
          </div>
        </aside>

        <section className="min-h-[760px] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="relative h-[520px] overflow-hidden border-b border-slate-200 bg-[#eef3ee] sm:h-[640px] lg:h-[760px]">
            <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(90deg,rgba(71,85,105,0.09)_1px,transparent_1px),linear-gradient(0deg,rgba(71,85,105,0.09)_1px,transparent_1px)] [background-size:56px_56px]" />
            <div className="absolute left-[-8%] top-[46%] h-14 w-[120%] -rotate-6 rounded-full bg-white/70 shadow-inner" />
            <div className="absolute left-[18%] top-[-8%] h-[118%] w-12 rotate-12 rounded-full bg-white/50" />
            <div className="absolute bottom-[-18%] right-[-8%] h-[42%] w-[48%] rounded-tl-[90px] bg-[#dbeafe]/70" />
            <div className="absolute left-5 top-5 z-10 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur">
              Türkiye şarj ağı görünümü
            </div>

            {stations.map((station) => {
              const position = positionMap.get(station.id);
              const isVisible = visibleIds.has(station.id);
              const isSelected = selectedStation?.id === station.id;

              if (!position) {
                return null;
              }

              return (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => setSelectedId(station.id)}
                  className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-[0_14px_34px_rgba(15,23,42,0.28)] transition ${
                    isSelected ? "h-12 w-12 bg-blue-700" : "h-9 w-9 bg-slate-900"
                  } ${isVisible ? "opacity-100" : "opacity-20"}`}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                  aria-label={`${station.name} istasyonunu seç`}
                >
                  <MapPin className="m-auto h-5 w-5 text-white" />
                </button>
              );
            })}

            {selectedStation ? (
              <div className="absolute bottom-4 left-4 right-4 z-30 rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur md:left-auto md:w-[420px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                      Seçili istasyon
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight text-slate-950">
                      {selectedStation.name}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{selectedStation.address}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusTone(selectedStation)}`}>
                    {selectedStation.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <Gauge className="h-4 w-4 text-blue-700" />
                    <p className="mt-2 text-sm font-semibold text-slate-950">{selectedStation.power}</p>
                    <p className="text-xs text-slate-500">maksimum güç</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <Clock3 className="h-4 w-4 text-blue-700" />
                    <p className="mt-2 text-sm font-semibold text-slate-950">{selectedStation.hours}</p>
                    <p className="text-xs text-slate-500">çalışma saati</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedStation.amenities.map((item) => (
                    <span key={item} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={buildDirectionsUrl(selectedStation)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Navigation className="h-4 w-4" />
                    Yol tarifi al
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedId(stations[0]?.id ?? "")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <LocateFixed className="h-4 w-4" />
                    Merkeze dön
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </div>
  );
}
