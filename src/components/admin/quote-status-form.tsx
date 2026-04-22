"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { quoteStatusOptions } from "@/server/admin/constants";
import { adminQuoteUpdateSchema } from "@/server/admin/validators";

type QuoteStatusValues = z.infer<typeof adminQuoteUpdateSchema>;

type AssignableAdmin = {
  id: string;
  fullName: string;
  role: string;
};

type QuoteStatusFormProps = {
  quoteId: string;
  initialValues: QuoteStatusValues;
  assignableAdmins: AssignableAdmin[];
};

export function QuoteStatusForm({
  quoteId,
  initialValues,
  assignableAdmins
}: QuoteStatusFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<QuoteStatusValues>({
    resolver: zodResolver(adminQuoteUpdateSchema),
    defaultValues: initialValues
  });

  const onSubmit = handleSubmit(async (values) => {
    setFeedback(null);

    const response = await fetch(`/api/admin/quotes/${quoteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...values,
        assignedAdminId: values.assignedAdminId || null
      })
    });

    const data = (await response.json()) as { ok: boolean; message?: string };
    setFeedback(data.ok ? "Teklif guncellendi." : data.message ?? "Islem basarisiz.");

    if (data.ok) {
      router.refresh();
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <select className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("status")}>
        {quoteStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
        {...register("assignedAdminId")}
      >
        <option value="">Atanmamis</option>
        {assignableAdmins.map((admin) => (
          <option key={admin.id} value={admin.id}>
            {admin.fullName} - {admin.role}
          </option>
        ))}
      </select>

      <textarea
        rows={4}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
        placeholder="Not"
        {...register("note")}
      />

      {feedback ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {feedback}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isSubmitting ? "Guncelleniyor..." : "Teklifi Guncelle"}
      </button>
    </form>
  );
}
