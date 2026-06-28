"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import type { PublicSiteSettings } from "@/lib/site-settings";

type SiteSettingsFormProps = {
  settings: PublicSiteSettings;
};

type SiteSettingsResponse = {
  ok: boolean;
  message?: string;
};

function joinAreas(areas: string[]) {
  return areas.join("\n");
}

function splitAreas(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptionalLiraToKurus(value: string) {
  const trimmed = value.trim().replace(",", ".");

  if (!trimmed) {
    return undefined;
  }

  const amount = Number(trimmed);

  if (!Number.isFinite(amount) || amount < 0) {
    return undefined;
  }

  return Math.round(amount * 100);
}

function formatKurusAsLira(value?: number) {
  if (typeof value !== "number") {
    return "";
  }

  return (value / 100).toString();
}

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const router = useRouter();
  const [brandName, setBrandName] = useState(settings.brandName);
  const [description, setDescription] = useState(settings.description);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [logoAlt, setLogoAlt] = useState(settings.logoAlt);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [whatsappPhone, setWhatsappPhone] = useState(settings.whatsappPhone);
  const [supportHours, setSupportHours] = useState(settings.supportHours);
  const [streetAddress, setStreetAddress] = useState(settings.address.streetAddress);
  const [addressLocality, setAddressLocality] = useState(settings.address.addressLocality);
  const [addressRegion, setAddressRegion] = useState(settings.address.addressRegion);
  const [postalCode, setPostalCode] = useState(settings.address.postalCode);
  const [addressCountry, setAddressCountry] = useState(settings.address.addressCountry);
  const [mapEmbedUrl, setMapEmbedUrl] = useState(settings.mapEmbedUrl);
  const [serviceAreas, setServiceAreas] = useState(joinAreas(settings.serviceAreas));
  const [instagram, setInstagram] = useState(settings.socials.instagram ?? "");
  const [facebook, setFacebook] = useState(settings.socials.facebook ?? "");
  const [linkedin, setLinkedin] = useState(settings.socials.linkedin ?? "");
  const [youtube, setYoutube] = useState(settings.socials.youtube ?? "");
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(settings.maintenanceMessage);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    formatKurusAsLira(settings.shippingSettings.freeShippingThresholdKurus)
  );
  const [defaultShipping, setDefaultShipping] = useState(
    formatKurusAsLira(settings.shippingSettings.defaultShippingKurus)
  );
  const [carrierName, setCarrierName] = useState(settings.shippingSettings.carrierName ?? "");
  const [vatRate, setVatRate] = useState(
    typeof settings.taxSettings.vatRate === "number"
      ? String(settings.taxSettings.vatRate * 100)
      : ""
  );
  const [pricesIncludeVat, setPricesIncludeVat] = useState(
    settings.taxSettings.pricesIncludeVat ?? true
  );
  const [paymentProvider, setPaymentProvider] = useState(
    settings.paymentSettings.provider ?? "paytr"
  );
  const [paymentTestMode, setPaymentTestMode] = useState(
    settings.paymentSettings.testMode ?? false
  );
  const [installmentEnabled, setInstallmentEnabled] = useState(
    settings.paymentSettings.installmentEnabled ?? false
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const payload = {
      id: settings.id,
      brandName,
      description,
      logoUrl,
      logoAlt,
      phone,
      email,
      whatsappPhone,
      supportHours,
      streetAddress,
      addressLocality,
      addressRegion,
      postalCode,
      addressCountry,
      mapEmbedUrl,
      maintenanceMode,
      maintenanceMessage,
      shippingSettings: {
        freeShippingThresholdKurus: parseOptionalLiraToKurus(freeShippingThreshold),
        defaultShippingKurus: parseOptionalLiraToKurus(defaultShipping),
        carrierName
      },
      taxSettings: {
        vatRate: vatRate.trim() ? Number(vatRate.replace(",", ".")) / 100 : undefined,
        pricesIncludeVat
      },
      paymentSettings: {
        provider: paymentProvider,
        testMode: paymentTestMode,
        installmentEnabled
      },
      serviceAreas: splitAreas(serviceAreas),
      socials: {
        instagram,
        facebook,
        linkedin,
        youtube
      }
    };

    try {
      const response = await fetch("/api/admin/site/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = (await response.json().catch(() => ({ ok: false }))) as SiteSettingsResponse;

      setFeedback(
        response.ok && data.ok
          ? "Site genel ayarları kaydedildi."
          : data.message ?? "Site ayarları kaydedilemedi."
      );

      if (response.ok && data.ok) {
        router.refresh();
      }
    } catch {
      setFeedback("Site ayarları kaydedilirken bağlantı hatası oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
            Marka ve logo
          </p>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">Marka adı</span>
              <input
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">Logo URL</span>
              <input
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="/uploads/logo.png veya https://..."
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">Logo alt metni</span>
              <input
                value={logoAlt}
                onChange={(event) => setLogoAlt(event.target.value)}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
              />
            </label>
            {logoUrl ? (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="mb-2 text-xs font-semibold text-slate-500">Logo önizleme</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt={logoAlt || brandName} className="max-h-16 w-auto" />
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
            Site mesajı
          </p>
          <label className="mt-4 grid gap-1.5">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Genel açıklama
            </span>
            <textarea
              rows={6}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
          </label>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
            İletişim
          </p>
          <div className="mt-4 grid gap-3">
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Telefon"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="E-posta"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={whatsappPhone}
              onChange={(event) => setWhatsappPhone(event.target.value)}
              placeholder="WhatsApp no"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={supportHours}
              onChange={(event) => setSupportHours(event.target.value)}
              placeholder="Mo-Sa 09:00-18:00"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 xl:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
            Adres ve harita
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={streetAddress}
              onChange={(event) => setStreetAddress(event.target.value)}
              placeholder="Açık adres"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2"
            />
            <input
              value={addressLocality}
              onChange={(event) => setAddressLocality(event.target.value)}
              placeholder="İlçe"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={addressRegion}
              onChange={(event) => setAddressRegion(event.target.value)}
              placeholder="İl"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              placeholder="Posta kodu"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={addressCountry}
              onChange={(event) => setAddressCountry(event.target.value)}
              placeholder="TR"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={mapEmbedUrl}
              onChange={(event) => setMapEmbedUrl(event.target.value)}
              placeholder="Google Maps embed URL"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2"
            />
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
            Hizmet bölgeleri
          </p>
          <textarea
            rows={5}
            value={serviceAreas}
            onChange={(event) => setServiceAreas(event.target.value)}
            className="mt-4 rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Türkiye geneli"
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Her satıra bir bölge yazabilirsiniz. Virgül de desteklenir.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
            Sosyal medya
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={instagram}
              onChange={(event) => setInstagram(event.target.value)}
              placeholder="Instagram URL"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={facebook}
              onChange={(event) => setFacebook(event.target.value)}
              placeholder="Facebook URL"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={linkedin}
              onChange={(event) => setLinkedin(event.target.value)}
              placeholder="LinkedIn URL"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={youtube}
              onChange={(event) => setYoutube(event.target.value)}
              placeholder="YouTube URL"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
            Bakim modu
          </p>
          <label className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(event) => setMaintenanceMode(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-700"
            />
            <span className="text-sm font-medium text-slate-700">Public siteyi bakima al</span>
          </label>
          <textarea
            rows={4}
            value={maintenanceMessage}
            onChange={(event) => setMaintenanceMessage(event.target.value)}
            className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
            placeholder="Bakim ekrani mesaji"
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
            Kargo ve vergi
          </p>
          <div className="mt-4 grid gap-3">
            <input
              value={carrierName}
              onChange={(event) => setCarrierName(event.target.value)}
              placeholder="Kargo firmasi"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={freeShippingThreshold}
              onChange={(event) => setFreeShippingThreshold(event.target.value)}
              placeholder="Ucretsiz kargo esigi (TL)"
              inputMode="decimal"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={defaultShipping}
              onChange={(event) => setDefaultShipping(event.target.value)}
              placeholder="Varsayilan kargo (TL)"
              inputMode="decimal"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={vatRate}
              onChange={(event) => setVatRate(event.target.value)}
              placeholder="KDV orani (%)"
              inputMode="decimal"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                checked={pricesIncludeVat}
                onChange={(event) => setPricesIncludeVat(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-700"
              />
              <span className="text-sm font-medium text-slate-700">Fiyatlara KDV dahil</span>
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
            Odeme ayarlari
          </p>
          <div className="mt-4 grid gap-3">
            <input
              value={paymentProvider}
              onChange={(event) => setPaymentProvider(event.target.value)}
              placeholder="Odeme saglayici"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                checked={paymentTestMode}
                onChange={(event) => setPaymentTestMode(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-700"
              />
              <span className="text-sm font-medium text-slate-700">Test modu isareti</span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                checked={installmentEnabled}
                onChange={(event) => setInstallmentEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-700"
              />
              <span className="text-sm font-medium text-slate-700">Taksit secenegi aktif</span>
            </label>
          </div>
        </section>
      </div>

      {feedback ? <p className="text-sm font-medium text-slate-700">{feedback}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save className="h-4 w-4" aria-hidden />
        {isSubmitting ? "Kaydediliyor..." : "Genel site ayarlarını kaydet"}
      </button>
    </form>
  );
}
