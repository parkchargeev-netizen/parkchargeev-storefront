"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, UserRound } from "lucide-react";

import {
  type AccountFormEvent,
  Feedback,
  type FormState,
  getJsonValue,
  parseApiResponse
} from "@/components/customer/account-form-utils";

export type CustomerProfileFormModel = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  marketingConsent: boolean;
};

export function ProfileForm({ customer }: { customer: CustomerProfileFormModel }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: AccountFormEvent) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setState(null);

    try {
      await parseApiResponse(
        await fetch("/api/customer/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            firstName: getJsonValue(formData, "firstName"),
            lastName: getJsonValue(formData, "lastName"),
            phone: getJsonValue(formData, "phone"),
            marketingConsent: formData.get("marketingConsent") === "on"
          })
        })
      );
      setState({ type: "success", text: "Profil bilgileri güncellendi." });
      router.refresh();
    } catch (error) {
      setState({
        type: "error",
        text: error instanceof Error ? error.message : "Profil güncellenemedi."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="profil" className="surface-card scroll-mt-28 p-6 lg:p-8">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserRound className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-bold tracking-normal text-on-surface">
            Profil ve iletişim
          </h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Checkout, teklif ve servis formlarında kullanılacak bilgileri güncel tutun.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Ad</span>
          <input
            name="firstName"
            required
            minLength={2}
            defaultValue={customer.firstName ?? ""}
            autoComplete="given-name"
            className="rounded-lg border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Soyad</span>
          <input
            name="lastName"
            required
            minLength={2}
            defaultValue={customer.lastName ?? ""}
            autoComplete="family-name"
            className="rounded-lg border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">E-posta</span>
          <input
            value={customer.email}
            readOnly
            autoComplete="email"
            className="rounded-lg border border-outline-variant/45 bg-surface-container-low px-4 py-3 text-on-surface-variant outline-none"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Telefon</span>
          <input
            name="phone"
            required
            minLength={10}
            defaultValue={customer.phone ?? ""}
            autoComplete="tel"
            inputMode="tel"
            className="rounded-lg border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-on-surface-variant md:col-span-2">
          <input
            name="marketingConsent"
            type="checkbox"
            defaultChecked={customer.marketingConsent}
            className="mt-1 rounded border-outline-variant"
          />
          Kampanya, bakım ve kurulum hatırlatmaları için iletişim izni veriyorum.
        </label>
        <div className="grid gap-3 md:col-span-2">
          <Feedback state={state} />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Profili kaydet
          </button>
        </div>
      </form>
    </section>
  );
}
