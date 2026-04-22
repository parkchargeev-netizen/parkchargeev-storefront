"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { orderStatusOptions } from "@/server/admin/constants";
import { adminOrderUpdateSchema } from "@/server/admin/validators";

type OrderStatusValues = z.infer<typeof adminOrderUpdateSchema>;

type OrderStatusFormProps = {
  orderId: string;
  initialValues: OrderStatusValues;
};

export function OrderStatusForm({
  orderId,
  initialValues
}: OrderStatusFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<OrderStatusValues>({
    resolver: zodResolver(adminOrderUpdateSchema),
    defaultValues: initialValues
  });

  const onSubmit = handleSubmit(async (values) => {
    setFeedback(null);

    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const data = (await response.json()) as { ok: boolean; message?: string };
    setFeedback(data.ok ? "Siparis guncellendi." : data.message ?? "Islem basarisiz.");

    if (data.ok) {
      router.refresh();
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <select className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("status")}>
        {orderStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
        placeholder="Kargo firmasi"
        {...register("shippingCarrier")}
      />
      <input
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
        placeholder="Takip numarasi"
        {...register("trackingNumber")}
      />
      <input
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
        placeholder="Takip URL"
        {...register("trackingUrl")}
      />
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
        {isSubmitting ? "Guncelleniyor..." : "Siparisi Guncelle"}
      </button>
    </form>
  );
}
