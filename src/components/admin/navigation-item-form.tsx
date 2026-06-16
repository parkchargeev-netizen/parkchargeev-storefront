"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { adminNavigationItemSchema } from "@/server/admin/validators";

type NavigationItemValues = z.input<typeof adminNavigationItemSchema>;

type NavigationItemFormProps = {
  mode: "create" | "edit";
  item?: Partial<NavigationItemValues> & { id?: string };
};

const areaOptions = [
  { value: "primary", label: "Üst menü" },
  { value: "footer", label: "Footer navigasyon" },
  { value: "legal", label: "Footer destek" }
] as const;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs font-medium text-red-600">{message}</p> : null;
}

const navigationGuide = [
  "Üst menüde 5-7 ana link yeterlidir; fazla link mobilde kalabalık yaratır.",
  "Etiket kısa olmalı: Mağaza, Kurulum, Blog, İletişim gibi.",
  "Site içi linkler /magaza gibi / ile başlamalı; dış linklerde tam https adresi kullanılmalı.",
  "Yeni sekme yalnızca dış bağlantılar veya dokümanlar için tercih edilmeli."
];

export function NavigationItemForm({ mode, item }: NavigationItemFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<NavigationItemValues>({
    resolver: zodResolver(adminNavigationItemSchema),
    defaultValues: {
      area: item?.area ?? "primary",
      label: item?.label ?? "",
      href: item?.href ?? "/",
      sortOrder: item?.sortOrder ?? 0,
      isActive: item?.isActive ?? true,
      opensInNewTab: item?.opensInNewTab ?? false,
      rel: item?.rel ?? ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setFeedback(null);
    const response = await fetch("/api/admin/site/navigation", {
      method: mode === "create" ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...values,
        id: item?.id
      })
    });
    const data = (await response.json()) as { ok: boolean; message?: string };

    setFeedback(data.ok ? "Navigasyon kaydı kaydedildi." : data.message ?? "İşlem başarısız.");

    if (data.ok) {
      if (mode === "create") {
        reset({
          area: "primary",
          label: "",
          href: "/",
          sortOrder: 0,
          isActive: true,
          opensInNewTab: false,
          rel: ""
        });
      }

      router.refresh();
    }
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
          Menü yazım rehberi
        </p>
        <ul className="mt-2 grid gap-2 text-xs leading-5 text-slate-600 md:grid-cols-2">
          {navigationGuide.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-3 lg:grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)_120px]">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Alan
          </span>
          <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" {...register("area")}>
            {areaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Etiket
          </span>
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="Hizmetler" {...register("label")} />
          <FieldError message={errors.label?.message} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Link
          </span>
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="/hizmetler" {...register("href")} />
          <FieldError message={errors.href?.message} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Sira
          </span>
          <input type="number" className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="10" {...register("sortOrder", { valueAsNumber: true })} />
        </label>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Rel
          </span>
          <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" placeholder="noopener noreferrer" {...register("rel")} />
        </label>
        <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" {...register("isActive")} />
          Aktif
        </label>
        <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" {...register("opensInNewTab")} />
          Yeni sekme
        </label>
      </div>
      {feedback ? <p className="text-sm text-slate-600">{feedback}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isSubmitting ? "Kaydediliyor..." : mode === "create" ? "Menü linki ekle" : "Menü linkini güncelle"}
      </button>
    </form>
  );
}
