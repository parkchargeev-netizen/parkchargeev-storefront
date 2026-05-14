"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

import {
  type AccountFormEvent,
  Feedback,
  type FormState,
  parseApiResponse
} from "@/components/customer/account-form-utils";

export function PasswordForm() {
  const [state, setState] = useState<FormState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: AccountFormEvent) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newPassword = String(formData.get("newPassword") ?? "");
    const newPasswordConfirm = String(formData.get("newPasswordConfirm") ?? "");
    setIsSubmitting(true);
    setState(null);

    if (newPassword !== newPasswordConfirm) {
      setState({ type: "error", text: "Yeni şifre tekrarı aynı değil." });
      setIsSubmitting(false);
      return;
    }

    try {
      await parseApiResponse(
        await fetch("/api/customer/security/password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            currentPassword: String(formData.get("currentPassword") ?? ""),
            newPassword
          })
        })
      );
      form.reset();
      setState({ type: "success", text: "Şifreniz güncellendi." });
    } catch (error) {
      setState({
        type: "error",
        text: error instanceof Error ? error.message : "Şifre güncellenemedi."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="guvenlik" className="surface-card scroll-mt-28 p-6 lg:p-8">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-on-surface">
            Güvenlik
          </h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Oturum httpOnly cookie ile tutulur. Şifre değişiminde mevcut şifre doğrulanır.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Mevcut şifre</span>
          <input
            name="currentPassword"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Yeni şifre</span>
          <input
            name="newPassword"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Yeni şifre tekrarı</span>
          <input
            name="newPasswordConfirm"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <div className="grid gap-3 md:col-span-3">
          <Feedback state={state} />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Şifreyi güncelle
          </button>
        </div>
      </form>
    </section>
  );
}
