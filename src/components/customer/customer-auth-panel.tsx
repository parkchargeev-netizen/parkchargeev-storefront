"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";

type Mode = "login" | "register";

type AuthResponse = {
  ok: boolean;
  message?: string;
};

export function CustomerAuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setMessage(null);

    const endpoint =
      mode === "login" ? "/api/customer/auth/login" : "/api/customer/auth/register";
    const payload =
      mode === "login"
        ? {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? "")
          }
        : {
            firstName: String(formData.get("firstName") ?? ""),
            lastName: String(formData.get("lastName") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            marketingConsent: formData.get("marketingConsent") === "on"
          };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.ok) {
        setMessage(data.message ?? "İşlem tamamlanamadı.");
        return;
      }

      router.push("/hesabim");
      router.refresh();
    } catch {
      setMessage("Bağlantı sırasında hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:items-start">
      <section className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Müşteri paneli
        </p>
        <h1 className="max-w-3xl text-4xl font-black tracking-[-0.06em] text-on-surface md:text-6xl">
          Sipariş, cihaz ve servis sürecini tek yerden takip edin
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-on-surface-variant">
          ParkChargeEV hesabınızla teklif taleplerinizi, ödeme sonrası siparişlerinizi,
          kurulum adreslerinizi ve servis kayıtlarınızı yönetebilirsiniz.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Sipariş takibi", "PayTR sonrası sipariş ve ödeme durumu"],
            ["Adres defteri", "Kurulum ve teslimat adresleri"],
            ["Servis geçmişi", "Bakım, keşif ve teknik destek kayıtları"]
          ].map(([title, detail]) => (
            <div key={title} className="rounded-[24px] bg-surface-container-low p-5">
              <p className="text-sm font-semibold text-on-surface">{title}</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card p-6 lg:p-8">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-container-low p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage(null);
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "login" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
            }`}
          >
            <LogIn className="h-4 w-4" />
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setMessage(null);
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "register" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Kayıt Ol
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          {mode === "register" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-on-surface-variant">Ad</span>
                <input
                  name="firstName"
                  required
                  minLength={2}
                  autoComplete="given-name"
                  className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-on-surface-variant">Soyad</span>
                <input
                  name="lastName"
                  required
                  minLength={2}
                  autoComplete="family-name"
                  className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
                />
              </label>
            </div>
          ) : null}

          <label className="grid gap-2">
            <span className="text-sm font-medium text-on-surface-variant">E-posta</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="ornek@sirket.com"
              className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
            />
          </label>

          {mode === "register" ? (
            <label className="grid gap-2">
              <span className="text-sm font-medium text-on-surface-variant">Telefon</span>
              <input
                name="phone"
                required
                minLength={10}
                autoComplete="tel"
                inputMode="tel"
                placeholder="0555 555 55 55"
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
              />
            </label>
          ) : null}

          <label className="grid gap-2">
            <span className="text-sm font-medium text-on-surface-variant">Şifre</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
            />
          </label>

          {mode === "register" ? (
            <label className="flex items-start gap-3 text-sm leading-6 text-on-surface-variant">
              <input name="marketingConsent" type="checkbox" className="mt-1 rounded border-outline-variant" />
              Kampanya, bakım ve kurulum hatırlatmaları için iletişim izni veriyorum.
            </label>
          ) : null}

          {message ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isSubmitting
              ? "İşleniyor..."
              : mode === "login"
                ? "Müşteri Paneline Gir"
                : "Hesap Oluştur"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </section>
    </div>
  );
}
