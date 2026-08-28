"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { adminLoginSchema } from "@/server/admin/validators";

type LoginValues = z.infer<typeof adminLoginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });
      const data = (await response.json().catch(() => ({
        ok: false,
        message: "Sunucu yaniti okunamadi."
      }))) as { ok: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setErrorMessage(data.message ?? "Giris basarisiz.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setErrorMessage("Sunucuya ulasilamadi. Lutfen tekrar deneyin.");
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
          E-posta
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600"
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
          Sifre
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600"
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Giris yapılıyor..." : "Admin Girişi"}
      </button>
    </form>
  );
}
