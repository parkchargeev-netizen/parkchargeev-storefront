"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";

import {
  type AccountFormEvent,
  Feedback,
  type FormState,
  getJsonValue,
  parseApiResponse
} from "@/components/customer/account-form-utils";
import { serviceCoverageSummary } from "@/lib/service-coverage";

export type CustomerAddressFormModel = {
  id: string;
  label: string;
  fullName: string | null;
  city: string;
  district: string;
  line1: string;
  line2: string | null;
  postalCode: string | null;
  isDefault: boolean;
};

export function AddressManager({ addresses }: { addresses: CustomerAddressFormModel[] }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function handleSubmit(event: AccountFormEvent) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setPendingAction("address");
    setState(null);

    try {
      await parseApiResponse(
        await fetch("/api/customer/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            label: getJsonValue(formData, "label"),
            fullName: getJsonValue(formData, "fullName"),
            city: getJsonValue(formData, "city"),
            district: getJsonValue(formData, "district"),
            line1: getJsonValue(formData, "line1"),
            line2: getJsonValue(formData, "line2"),
            postalCode: getJsonValue(formData, "postalCode"),
            isDefault: formData.get("isDefault") === "on"
          })
        })
      );
      form.reset();
      setState({ type: "success", text: "Adres defterine eklendi." });
      router.refresh();
    } catch (error) {
      setState({
        type: "error",
        text: error instanceof Error ? error.message : "Adres kaydedilemedi."
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDelete(addressId: string) {
    setPendingAction(`delete-${addressId}`);
    setState(null);

    try {
      await parseApiResponse(
        await fetch(`/api/customer/addresses/${addressId}`, {
          method: "DELETE"
        })
      );
      setState({ type: "success", text: "Adres silindi." });
      router.refresh();
    } catch (error) {
      setState({
        type: "error",
        text: error instanceof Error ? error.message : "Adres silinemedi."
      });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <section id="adresler" className="surface-card scroll-mt-28 p-6 lg:p-8">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-secondary">
          <Plus className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-bold tracking-normal text-on-surface">
            Adres defteri
          </h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Kurulum ve teslimat adreslerini hızlı checkout için kayıt altında tutun.
            {` ${serviceCoverageSummary.shipping}; ${serviceCoverageSummary.installation}.`}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address.id}
              className="grid gap-4 rounded-lg bg-surface-container-low p-5 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-on-surface">{address.label}</p>
                  {address.isDefault ? (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Varsayılan
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  {address.fullName ? `${address.fullName} · ` : ""}
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""} · {address.district} /{" "}
                  {address.city}
                  {address.postalCode ? ` · ${address.postalCode}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(address.id)}
                disabled={pendingAction === `delete-${address.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-65"
              >
                {pendingAction === `delete-${address.id}` ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Sil
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-surface-container-low p-5 text-sm leading-6 text-on-surface-variant">
            Kayıtlı adres yok. İlk adresinizi eklediğinizde checkout ve kurulum formları daha hızlı ilerler.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Adres adı</span>
          <input
            name="label"
            required
            placeholder="Ev, iş yeri, depo"
            className="rounded-lg border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Alıcı adı</span>
          <input
            name="fullName"
            autoComplete="name"
            placeholder="Ad Soyad"
            className="rounded-lg border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">İl</span>
          <input
            name="city"
            required
            autoComplete="address-level1"
            placeholder="İlinizi yazın"
            className="rounded-lg border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">İlçe</span>
          <input
            name="district"
            required
            autoComplete="address-level2"
            className="rounded-lg border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-medium text-on-surface-variant">Adres</span>
          <input
            name="line1"
            required
            minLength={5}
            autoComplete="street-address"
            className="rounded-lg border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Adres devamı</span>
          <input
            name="line2"
            className="rounded-lg border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Posta kodu</span>
          <input
            name="postalCode"
            autoComplete="postal-code"
            className="rounded-lg border border-outline-variant/45 bg-white px-4 py-3 outline-none transition focus:border-primary"
          />
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-on-surface-variant md:col-span-2">
          <input name="isDefault" type="checkbox" className="mt-1 rounded border-outline-variant" />
          Bu adresi varsayılan teslimat ve kurulum adresi yap.
        </label>
        <div className="grid gap-3 md:col-span-2">
          <Feedback state={state} />
          <button
            type="submit"
            disabled={pendingAction === "address"}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-65"
          >
            {pendingAction === "address" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Adres ekle
          </button>
        </div>
      </form>
    </section>
  );
}
