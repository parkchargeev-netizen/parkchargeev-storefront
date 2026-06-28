"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Sparkles } from "lucide-react";

type ActionState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

const idleState: ActionState = { status: "idle", message: "" };

function stateClassName(status: ActionState["status"]) {
  if (status === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "error") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  return "border-slate-200 bg-white text-slate-600";
}

export function AiGenerateButton({
  moduleKey,
  label = "Öneri üret"
}: {
  moduleKey: string;
  label?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>(idleState);

  async function generate() {
    setState({ status: "loading", message: "AI önerisi hazırlanıyor..." });

    const response = await fetch("/api/admin/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleKey })
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;

    if (!response.ok || !payload?.ok) {
      setState({
        status: "error",
        message: payload?.message ?? "AI önerisi üretilemedi."
      });
      return;
    }

    setState({ status: "success", message: "AI önerisi kaydedildi." });
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={generate}
        disabled={state.status === "loading"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#063326] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0a4a38] disabled:cursor-wait disabled:opacity-70"
      >
        <Sparkles className="h-4 w-4" />
        {state.status === "loading" ? "Hazırlanıyor" : label}
      </button>
      {state.message ? (
        <p className={`rounded-lg border px-3 py-2 text-xs font-semibold ${stateClassName(state.status)}`}>
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

export function AutomationRunButton({ automationId }: { automationId: string }) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>(idleState);

  async function runAutomation() {
    setState({ status: "loading", message: "Otomasyon çalıştırılıyor..." });

    const response = await fetch(`/api/admin/automations/${automationId}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triggerSource: "manual" })
    });
    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; message?: string; summary?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      setState({
        status: "error",
        message: payload?.message ?? "Otomasyon çalıştırılamadı."
      });
      return;
    }

    setState({ status: "success", message: payload.summary ?? "Otomasyon tamamlandı." });
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={runAutomation}
        disabled={state.status === "loading"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-70"
      >
        <Play className="h-4 w-4" />
        {state.status === "loading" ? "Çalışıyor" : "Manuel çalıştır"}
      </button>
      {state.message ? (
        <p className={`rounded-lg border px-3 py-2 text-xs font-semibold ${stateClassName(state.status)}`}>
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

export function AutomationForm() {
  const router = useRouter();
  const [state, setState] = useState<ActionState>(idleState);
  const schedules = useMemo(() => ["hourly", "daily", "weekly", "manual"], []);

  async function submit(formData: FormData) {
    setState({ status: "loading", message: "Otomasyon kaydediliyor..." });

    const payload = {
      automationKey: String(formData.get("automationKey") ?? ""),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      status: String(formData.get("status") ?? "active"),
      triggerType: String(formData.get("triggerType") ?? "scheduled"),
      schedule: String(formData.get("schedule") ?? "daily")
    };

    const response = await fetch("/api/admin/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;

    if (!response.ok || !result?.ok) {
      setState({ status: "error", message: result?.message ?? "Otomasyon kaydedilemedi." });
      return;
    }

    setState({ status: "success", message: "Otomasyon kaydedildi." });
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Anahtar
          <input
            name="automationKey"
            required
            minLength={3}
            maxLength={100}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="ornek_otomasyon"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Başlık
          <input
            name="title"
            required
            minLength={3}
            maxLength={180}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Otomasyon başlığı"
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Açıklama
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={2000}
          className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Ne zaman çalışır, hangi aksiyonu üretir?"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Durum
          <select name="status" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="active">Aktif</option>
            <option value="paused">Pasif</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Tetikleme
          <select name="triggerType" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="scheduled">Zamanlı</option>
            <option value="manual">Manuel</option>
            <option value="hybrid">Zamanlı + manuel</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Zamanlama
          <select name="schedule" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            {schedules.map((schedule) => (
              <option key={schedule} value={schedule}>
                {schedule}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={state.status === "loading"}
        className="rounded-lg bg-[#063326] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0a4a38] disabled:cursor-wait disabled:opacity-70"
      >
        {state.status === "loading" ? "Kaydediliyor" : "Otomasyon ekle"}
      </button>
      {state.message ? (
        <p className={`rounded-lg border px-3 py-2 text-xs font-semibold ${stateClassName(state.status)}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
