"use client";

import { useState } from "react";

import { contactReasons } from "@/lib/contact-reasons";
import {
  getLeadCoverageHelp,
  leadCityOptions,
  serviceCoverageSummary,
  validateLeadServiceCoverage
} from "@/lib/service-coverage";

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
  const [selectedReason, setSelectedReason] = useState(defaultReason ?? "");
  const [selectedCity, setSelectedCity] = useState("");
  const fieldClassName = compact
    ? "rounded-2xl border border-outline-variant/45 bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-primary"
    : "rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary";
  const labelClassName = compact ? "grid gap-1.5" : "grid gap-2";
  const coverageHelp = getLeadCoverageHelp(selectedReason);

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
      setSelectedCity("");
      if (defaultReason) {
        const reasonField = form.elements.namedItem("reason");
        if (reasonField instanceof HTMLSelectElement) {
          reasonField.value = defaultReason;
        }
        setSelectedReason(defaultReason);
      } else {
        setSelectedReason("");
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
    <div className={`lead-form-card surface-card ${compact ? "lead-form-card--compact p-5 lg:p-6" : "p-8"}`}>
      <p className="text-xs font-black uppercase text-primary">
        {title}
      </p>
      <p className={`${compact ? "mt-2 text-sm leading-6" : "mt-4 text-base leading-7"} max-w-2xl text-on-surface-variant`}>
        {description}
      </p>

      <form
        className={`${compact ? "mt-5 gap-3" : "mt-8 gap-4"} grid md:grid-cols-2`}
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          setError(null);

          const form = event.currentTarget;
          const formData = new FormData(form);
          const payload = Object.fromEntries(formData.entries());
          const coverageValidation = validateLeadServiceCoverage(
            String(payload.reason ?? ""),
            String(payload.city ?? "")
          );

          if (!coverageValidation.ok) {
            setError(coverageValidation.message);
            return;
          }

          void submitLead(payload, form);
        }}
      >
        <label className={labelClassName}>
          <span className="text-sm text-on-surface-variant">Ad Soyad</span>
          <input
            required
            autoComplete="name"
            name="fullName"
            placeholder="Ad Soyad"
            className={fieldClassName}
          />
        </label>

        <label className={labelClassName}>
          <span className="text-sm text-on-surface-variant">Firma / Site Adı</span>
          <input
            name="company"
            placeholder="Opsiyonel"
            className={fieldClassName}
          />
        </label>

        <label className={labelClassName}>
          <span className="text-sm text-on-surface-variant">E-posta</span>
          <input
            required
            type="email"
            autoComplete="email"
            name="email"
            placeholder="ornek@parkchargeev.com"
            className={fieldClassName}
          />
        </label>

        <label className={labelClassName}>
          <span className="text-sm text-on-surface-variant">Telefon</span>
          <input
            required
            aria-describedby="lead-phone-help"
            autoComplete="tel"
            inputMode="tel"
            name="phone"
            placeholder="05xx xxx xx xx"
            className={fieldClassName}
          />
          <span id="lead-phone-help" className={`${compact ? "sr-only" : "text-xs leading-5 text-on-surface-variant"}`}>
            Keşif randevusu ve teklif netleştirme için kullanılır.
          </span>
        </label>

        <label className={labelClassName}>
          <span className="text-sm text-on-surface-variant">Şehir</span>
          <input
            required
            name="city"
            placeholder="Sakarya veya Kocaeli"
            list="lead-city-options"
            value={selectedCity}
            onChange={(event) => setSelectedCity(event.target.value)}
            className={fieldClassName}
          />
          <datalist id="lead-city-options">
            {leadCityOptions.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </label>

        <label className={labelClassName}>
          <span className="text-sm text-on-surface-variant">Talep Tipi</span>
          <select
            required
            name="reason"
            value={selectedReason}
            onChange={(event) => setSelectedReason(event.target.value)}
            className={fieldClassName}
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

        <div className={`${compact ? "px-4 py-3 text-xs leading-5" : "px-4 py-4 text-sm leading-6"} md:col-span-2 rounded-2xl border border-primary/15 bg-primary/5 text-on-surface-variant`}>
          <span className="font-black text-primary">{coverageHelp}</span>
          <span className="mt-1 block">
            {serviceCoverageSummary.freeSurvey} · {serviceCoverageSummary.installation}
          </span>
        </div>

        <label className={`${labelClassName} md:col-span-2`}>
          <span className="text-sm text-on-surface-variant">İhtiyaç Özeti</span>
          <textarea
            required
            name="message"
            rows={compact ? 3 : 6}
            placeholder="Araç adedi, kullanım tipi, lokasyon ve beklentinizi paylaşın."
            className={`${fieldClassName} min-h-0 resize-y rounded-3xl`}
          />
        </label>

        <label className={`${compact ? "px-4 py-3 text-xs leading-5" : "px-4 py-4 text-sm"} md:col-span-2 flex items-start gap-3 rounded-2xl bg-surface-container-low text-on-surface-variant`}>
          <input
            required
            type="checkbox"
            name="privacyConsent"
            value="true"
            className="mt-1 rounded border-outline-variant"
          />
          ParkChargeEV&apos;in benimle teklif, keşif ve proje değerlendirmesi için iletişime geçmesini kabul ediyorum.
        </label>

        <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${compact ? "px-5 py-3 text-sm" : "px-6 py-4 text-base"} rounded-2xl bg-linear-to-r from-primary to-secondary font-black text-white disabled:opacity-70`}
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
