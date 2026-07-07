"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

type FormState = {
  isSubmitting: boolean;
  message: string | null;
};

function useOperationForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>({ isSubmitting: false, message: null });

  async function submit(endpoint: string, payload: Record<string, unknown>, method = "POST") {
    setState({ isSubmitting: true, message: null });

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json().catch(() => ({ ok: false }))) as {
        ok?: boolean;
        message?: string;
      };

      setState({
        isSubmitting: false,
        message: response.ok && data.ok ? "İşlem kaydedildi." : data.message ?? "İşlem başarısız."
      });

      if (response.ok && data.ok) {
        router.refresh();
      }
    } catch {
      setState({ isSubmitting: false, message: "Sunucuya ulaşılamadı." });
    }
  }

  return { ...state, submit };
}

function getFormValue(form: HTMLFormElement, name: string) {
  const value = new FormData(form).get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalNumber(form: HTMLFormElement, name: string) {
  const value = getFormValue(form, name);
  return value ? Number(value) : undefined;
}

function SubmitButton({ isSubmitting, label }: { isSubmitting: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? "Kaydediliyor..." : label}
    </button>
  );
}

export function InventoryAdjustmentForm() {
  const { isSubmitting, message, submit } = useOperationForm();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    void submit("/api/admin/inventory", {
      variantId: getFormValue(form, "variantId"),
      quantityAfter: getOptionalNumber(form, "quantityAfter") ?? 0,
      note: getFormValue(form, "note")
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-bold text-slate-950">Manuel stok düzeltmesi</p>
      <input name="variantId" required placeholder="Varyant ID" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="quantityAfter" required type="number" min="0" placeholder="Yeni stok" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <textarea name="note" placeholder="Not" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <SubmitButton isSubmitting={isSubmitting} label="Stok düzelt" />
    </form>
  );
}

export function NotificationMarkButton({ ids, isRead }: { ids: string[]; isRead: boolean }) {
  const { isSubmitting, message, submit } = useOperationForm();

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={isSubmitting || ids.length === 0}
        onClick={() => submit("/api/admin/notifications", { ids, isRead }, "PATCH")}
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
      >
        {isRead ? "Okundu işaretle" : "Okunmadı işaretle"}
      </button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}

export function ArchiveOperationButton({
  endpoint,
  id,
  label = "Arsivle",
  confirmation = "Bu kayit arsivlensin mi?",
  mode = "archive"
}: {
  endpoint: string;
  id: string;
  label?: string;
  confirmation?: string;
  mode?: "archive" | "delete";
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    if (!window.confirm(confirmation)) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const params = new URLSearchParams({ id });

      if (mode === "delete") {
        params.set("mode", "delete");
      }

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        method: "DELETE"
      });
      const data = (await response.json().catch(() => ({ ok: false }))) as {
        ok?: boolean;
        message?: string;
      };

      setMessage(response.ok && data.ok ? "Kayit guncellendi." : data.message ?? "Islem basarisiz.");

      if (response.ok && data.ok) {
        router.refresh();
      }
    } catch {
      setMessage("Sunucuya ulasilamadi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-3 grid gap-2">
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onClick}
        className={
          mode === "delete"
            ? "rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            : "rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {isSubmitting ? "Isleniyor..." : label}
      </button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
