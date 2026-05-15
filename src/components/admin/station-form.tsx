"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import type { AdminStation } from "@/server/admin/stations";

type StationFormProps = {
  station?: AdminStation | null;
};

type StationFormState = {
  externalId: string;
  name: string;
  status: string;
  power: string;
  connectorTypes: string;
  pricePerKwh: string;
  city: string;
  district: string;
  address: string;
  latitude: string;
  longitude: string;
  availableSockets: string;
  totalSockets: string;
  hours: string;
  operator: string;
  amenities: string;
  isActive: boolean;
  sortOrder: string;
};

function joinList(values?: string[]) {
  return values?.join(", ") ?? "";
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getInitialState(station?: AdminStation | null): StationFormState {
  return {
    externalId: station?.externalId ?? "",
    name: station?.name ?? "",
    status: station?.status ?? "Aktif",
    power: station?.power ?? "22 kW AC",
    connectorTypes: joinList(station?.connectorTypes) || "Type 2",
    pricePerKwh: station?.pricePerKwh ?? "₺8,90",
    city: station?.city ?? "",
    district: station?.district ?? "",
    address: station?.address ?? "",
    latitude: station ? String(station.latitude) : "",
    longitude: station ? String(station.longitude) : "",
    availableSockets: station ? String(station.availableSockets) : "0",
    totalSockets: station ? String(station.totalSockets) : "2",
    hours: station?.hours ?? "7/24",
    operator: station?.operator ?? "ParkChargeEV",
    amenities: joinList(station?.amenities),
    isActive: station?.isActive ?? true,
    sortOrder: station ? String(station.sortOrder) : "100"
  };
}

const fieldClass =
  "rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500";

export function StationForm({ station }: StationFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<StationFormState>(() => getInitialState(station));
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Key extends keyof StationFormState>(key: Key, value: StationFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const payload = {
      ...form,
      connectorTypes: splitList(form.connectorTypes),
      amenities: splitList(form.amenities),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      availableSockets: Number(form.availableSockets),
      totalSockets: Number(form.totalSockets),
      sortOrder: Number(form.sortOrder)
    };
    const response = await fetch(station ? `/api/admin/stations/${station.id}` : "/api/admin/stations", {
      method: station ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { ok: boolean; message?: string };

    setIsSubmitting(false);

    if (!response.ok || !data.ok) {
      setMessage(data.message ?? "İstasyon kaydedilemedi.");
      return;
    }

    setMessage("İstasyon kaydedildi.");
    router.refresh();

    if (!station) {
      setForm(getInitialState(null));
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Harici ID</span>
          <input
            className={fieldClass}
            value={form.externalId}
            onChange={(event) => updateField("externalId", event.target.value)}
            placeholder="station_istanbul_kadikoy"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">İstasyon adı</span>
          <input
            className={fieldClass}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="ParkChargeEV Kadıköy"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Şehir</span>
          <input className={fieldClass} value={form.city} onChange={(event) => updateField("city", event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">İlçe</span>
          <input className={fieldClass} value={form.district} onChange={(event) => updateField("district", event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Durum</span>
          <input className={fieldClass} value={form.status} onChange={(event) => updateField("status", event.target.value)} />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Adres</span>
        <textarea
          className={`${fieldClass} min-h-24`}
          value={form.address}
          onChange={(event) => updateField("address", event.target.value)}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Enlem</span>
          <input className={fieldClass} value={form.latitude} onChange={(event) => updateField("latitude", event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Boylam</span>
          <input className={fieldClass} value={form.longitude} onChange={(event) => updateField("longitude", event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Müsait soket</span>
          <input className={fieldClass} value={form.availableSockets} onChange={(event) => updateField("availableSockets", event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Toplam soket</span>
          <input className={fieldClass} value={form.totalSockets} onChange={(event) => updateField("totalSockets", event.target.value)} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Güç</span>
          <input className={fieldClass} value={form.power} onChange={(event) => updateField("power", event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">kWh fiyatı</span>
          <input className={fieldClass} value={form.pricePerKwh} onChange={(event) => updateField("pricePerKwh", event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Sıra</span>
          <input className={fieldClass} value={form.sortOrder} onChange={(event) => updateField("sortOrder", event.target.value)} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Konnektörler</span>
          <input className={fieldClass} value={form.connectorTypes} onChange={(event) => updateField("connectorTypes", event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Olanaklar</span>
          <input className={fieldClass} value={form.amenities} onChange={(event) => updateField("amenities", event.target.value)} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Çalışma saati</span>
          <input className={fieldClass} value={form.hours} onChange={(event) => updateField("hours", event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Operatör</span>
          <input className={fieldClass} value={form.operator} onChange={(event) => updateField("operator", event.target.value)} />
        </label>
      </div>

      <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => updateField("isActive", event.target.checked)}
        />
        Operasyonda aktif göster
      </label>

      {message ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isSubmitting ? "Kaydediliyor..." : station ? "İstasyonu Güncelle" : "İstasyon Ekle"}
      </button>
    </form>
  );
}
