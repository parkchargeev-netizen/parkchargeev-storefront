"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { leadStatusOptions } from "@/server/admin/constants";

type AssignableAdmin = {
  id: string;
  fullName: string;
  role: string;
};

type ServiceLeadStatusFormProps = {
  leadId: string;
  assignableAdmins: AssignableAdmin[];
  initialValues: {
    status: string;
    assignedAdminId?: string | null;
  };
};

function formatRole(role: string) {
  const labels: Record<string, string> = {
    superadmin: "Süper Admin",
    sales: "Satış",
    operations: "Operasyon",
    technician: "Saha Teknisyeni",
    editor: "İçerik Editörü"
  };

  return labels[role] ?? role;
}

export function ServiceLeadStatusForm({
  leadId,
  assignableAdmins,
  initialValues
}: ServiceLeadStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialValues.status);
  const [assignedAdminId, setAssignedAdminId] = useState(initialValues.assignedAdminId ?? "");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const response = await fetch(`/api/admin/service-leads/${leadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status,
        assignedAdminId: assignedAdminId || null,
        note
      })
    });
    const data = (await response.json()) as { ok: boolean; message?: string };

    setFeedback(data.ok ? "Saha talebi güncellendi." : data.message ?? "İşlem başarısız.");
    setIsSubmitting(false);

    if (data.ok) {
      setNote("");
      router.refresh();
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <select
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        {leadStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
        value={assignedAdminId}
        onChange={(event) => setAssignedAdminId(event.target.value)}
      >
        <option value="">Atanmamış</option>
        {assignableAdmins.map((admin) => (
          <option key={admin.id} value={admin.id}>
            {admin.fullName} ({formatRole(admin.role)})
          </option>
        ))}
      </select>
      <textarea
        rows={4}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
        placeholder="Operasyon notu"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      {feedback ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {feedback}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isSubmitting ? "Güncelleniyor..." : "Talebi güncelle"}
      </button>
    </form>
  );
}
