"use client";

import { useState } from "react";

import { contactReasons } from "@/lib/mock-data";

type LeadFormProps = {
  title?: string;
  description?: string;
  compact?: boolean;
  defaultReason?: string;
};

export function LeadForm({
  title = "Teklif ve keşif talebi",
  description = "İhtiyacınızı paylaşın, ürün ve kurulum yapısını birlikte netleştirelim.",
  compact = false,
  defaultReason
}: LeadFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitLead(
    payload: Record<string, FormDataEntryValue>,
    form: HTMLFormElement
  ) {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as {
        ok: boolean;
        message: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Talep gönderilemedi.");
      }

      setMessage(result.message);
      form.reset();
      if (defaultReason) {
        const reasonField = form.elements.namedItem("reason");
        if (reasonField instanceof HTMLSelectElement) {
          reasonField.value = defaultReason;
        }
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Talep gönderilirken beklenmeyen bir hata oluştu."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="surface-card p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
        {title}
      </p>
      <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
        {description}
      </p>

      <form
        className="mt-8 grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          setError(null);

          const form = event.currentTarget;
          const formData = new FormData(form);
          const payload = Object.fromEntries(formData.entries());

          void submitLead(payload, form);
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm text-on-surface-variant">Ad Soyad</span>
          <input
            required
            name="fullName"
            placeholder="Ad Soyad"
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-on-surface-variant">Firma / Site Adı</span>
          <input
            name="company"
            placeholder="Opsiyonel"
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-on-surface-variant">E-posta</span>
          <input
            required
            type="email"
            name="email"
            placeholder="ornek@parkchargeev.com"
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-on-surface-variant">Telefon</span>
          <input
            required
            name="phone"
            placeholder="05xx xxx xx xx"
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-on-surface-variant">Şehir</span>
          <input
            required
            name="city"
            placeholder="Sakarya"
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-on-surface-variant">Talep Tipi</span>
          <select
            required
            name="reason"
            defaultValue={defaultReason ?? ""}
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
          >
            <option value="" disabled>
              Talep tipi seçin
            </option>
            {contactReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-on-surface-variant">İhtiyaç Özeti</span>
          <textarea
            required
            name="message"
            rows={compact ? 4 : 6}
            placeholder="Araç adedi, kullanım tipi, lokasyon ve beklentinizi paylaşın."
            className="rounded-3xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
          />
        </label>

        <label className="md:col-span-2 flex items-start gap-3 rounded-2xl bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant">
          <input
            required
            type="checkbox"
            name="privacyConsent"
            value="true"
            className="mt-1 rounded border-outline-variant"
          />
          ParkChargeEV'in benimle teklif, keşif ve proje değerlendirmesi için iletişime geçmesini kabul ediyorum.
        </label>

        <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-linear-to-r from-primary to-secondary px-6 py-4 text-base font-semibold text-white disabled:opacity-70"
          >
            {isSubmitting ? "Gönderiliyor..." : "Talebi Gönder"}
          </button>

          {message ? (
            <p className="text-sm font-medium text-secondary">{message}</p>
          ) : null}
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        </div>
      </form>
    </div>
  );
}
