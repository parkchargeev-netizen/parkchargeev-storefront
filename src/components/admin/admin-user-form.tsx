"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { adminRoleLabels } from "@/server/admin/constants";
import { adminUserSchema } from "@/server/admin/validators";
import type { AdminRole } from "@/server/auth/authorization";

type AdminUserValues = z.input<typeof adminUserSchema>;

type AdminUserFormProps = {
  mode: "create" | "edit";
  user?: Partial<Omit<AdminUserValues, "phone">> & {
    id?: string;
    phone?: string | null;
  };
};

const statusOptions = [
  { value: "invited", label: "Davetli" },
  { value: "active", label: "Aktif" },
  { value: "disabled", label: "Devre dışı" }
] as const;

const roleOptions = Object.entries(adminRoleLabels) as Array<[AdminRole, string]>;

export function AdminUserForm({ mode, user }: AdminUserFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AdminUserValues>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      email: user?.email ?? "",
      fullName: user?.fullName ?? "",
      role: user?.role ?? "admin",
      status: user?.status ?? "active",
      phone: user?.phone ?? "",
      password: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setFeedback(null);
    const endpoint = mode === "create" ? "/api/admin/users" : `/api/admin/users/${user?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });
    const data = (await response.json()) as { ok: boolean; message?: string };

    setFeedback(data.ok ? "Admin kullanıcı kaydedildi." : data.message ?? "İşlem başarısız.");

    if (data.ok) {
      router.refresh();
    }
  });

  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
          placeholder="Ad soyad"
          {...register("fullName")}
        />
        <input
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
          placeholder="E-posta"
          type="email"
          {...register("email")}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <select className="rounded-lg border border-slate-300 px-4 py-3 text-sm" {...register("role")}>
          {roleOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select className="rounded-lg border border-slate-300 px-4 py-3 text-sm" {...register("status")}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
          placeholder="Telefon"
          {...register("phone")}
        />
      </div>
      <input
        className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
        placeholder={mode === "create" ? "Geçici şifre" : "Yeni şifre (boş bırakılırsa değişmez)"}
        type="password"
        {...register("password")}
      />
      {errors.password || errors.email || errors.fullName ? (
        <p className="text-sm text-red-600">
          {errors.password?.message || errors.email?.message || errors.fullName?.message}
        </p>
      ) : null}
      {feedback ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {feedback}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isSubmitting ? "Kaydediliyor..." : mode === "create" ? "Admin ekle" : "Kaydet / şifre sıfırla"}
      </button>
    </form>
  );
}
