"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

type PaytrOperationFormProps = {
  transactionId: string;
};

export function PaytrOperationForm({ transactionId }: PaytrOperationFormProps) {
  const router = useRouter();
  const [action, setAction] = useState("reconcile");
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/paytr/${transactionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action,
        note
      })
      });
      const data = (await response.json().catch(() => ({
        ok: false,
        message: "Sunucu yaniti okunamadi."
      }))) as { ok: boolean; message?: string };

    setFeedback(data.ok ? "PayTR operasyonu uygulandı." : data.message ?? "İşlem başarısız.");
    if (response.ok && data.ok) {
      setNote("");
      router.refresh();
    }
    } catch {
      setFeedback("Sunucuya ulaşılamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <select
        className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
        value={action}
        onChange={(event) => setAction(event.target.value)}
      >
        <option value="reconcile">Manuel mutabakat</option>
        <option value="mark_refunded">İade olarak işaretle</option>
      </select>
      <input
        className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
        placeholder="Operasyon notu"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      {feedback ? <p className="text-sm text-slate-600">{feedback}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 disabled:opacity-70"
      >
        {isSubmitting ? "İşleniyor..." : "Uygula"}
      </button>
    </form>
  );
}
