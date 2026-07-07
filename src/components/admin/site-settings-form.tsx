"use client";

import { Loader2, Save, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

import type { PublicSiteSettings } from "@/lib/site-settings";

type SiteSettingsFormProps = {
  settings: PublicSiteSettings;
};

type SiteSettingsResponse = {
  ok: boolean;
  message?: string;
};

type MediaUploadResponse = {
  ok: boolean;
  url?: string;
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

function splitAnnouncementMessages(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeOptionalUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
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
  const [announcementActive, setAnnouncementActive] = useState(
    settings.shippingSettings.announcement?.isActive ?? false
  );
  const [announcementMessages, setAnnouncementMessages] = useState(
    joinAreas(settings.shippingSettings.announcement?.messages ?? [])
  );
  const [announcementHref, setAnnouncementHref] = useState(
    settings.shippingSettings.announcement?.href ?? ""
  );
  const [announcementTone, setAnnouncementTone] = useState(
    settings.shippingSettings.announcement?.tone ?? "emerald"
  );
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
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadMessage, setLogoUploadMessage] = useState<string | null>(null);

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setLogoUploadMessage("Logo için yalnızca görsel dosyası yükleyin.");
      return;
    }

    setIsUploadingLogo(true);
    setLogoUploadMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData
      });
      const data = (await response.json().catch(() => ({ ok: false }))) as MediaUploadResponse;

      if (!response.ok || !data.ok || !data.url) {
        setLogoUploadMessage(data.message ?? "Logo yüklenemedi.");
        return;
      }

      setLogoUrl(data.url);
      setLogoUploadMessage("Logo yüklendi. Kaydettiğinizde site ayarlarına işlenecek.");

      if (!logoAlt.trim()) {
        setLogoAlt(`${brandName} logosu`);
      }
    } catch {
      setLogoUploadMessage("Logo yüklenirken bağlantı hatası oluştu.");
    } finally {
      setIsUploadingLogo(false);
    }
  }

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
        carrierName,
        announcement: {
          isActive: announcementActive,
          messages: splitAnnouncementMessages(announcementMessages),
          href: announcementHref,
          tone: announcementTone
        }
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
        instagram: normalizeOptionalUrl(instagram),
        facebook: normalizeOptionalUrl(facebook),
        linkedin: normalizeOptionalUrl(linkedin),
        youtube: normalizeOptionalUrl(youtube)
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
            <label className="grid gap-2 rounded-lg border border-dashed border-emerald-300 bg-white px-4 py-3">
              <span className="text-xs font-semibold uppercase text-emerald-700">
                Logo görseli yükle
              </span>
              <span className="text-xs leading-5 text-slate-500">
                PNG, JPG, SVG veya WebP logo yükleyin. Yükleme sonrası URL alanı otomatik güncellenir.
              </span>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
                {isUploadingLogo ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Upload className="h-4 w-4" aria-hidden />
                )}
                {isUploadingLogo ? "Yükleniyor..." : "Logo seç ve yükle"}
              </span>
              <input
                type="file"
                accept="image/*"
                disabled={isUploadingLogo}
                onChange={handleLogoUpload}
                className="sr-only"
              />
            </label>
            {logoUploadMessage ? (
              <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                {logoUploadMessage}
              </p>
            ) : null}
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
              placeholder="Google Maps linki veya embed URL"
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm md:col-span-2"
            />
            <p className="text-xs leading-5 text-slate-500 md:col-span-2">
              Embed URL harita görüntüsünü değiştirir. Normal Google Maps paylaşım linki girerseniz
              iletişim sayfasındaki “Google Maps’te aç” bağlantısı güncellenir.
            </p>
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
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Footer alanında görünür. Linkleri tam URL olarak veya instagram.com/hesap gibi
            yazabilirsiniz; kayıtta güvenli URL formatına çevrilir.
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
            Kampanya duyuru şeridi
          </p>
          <div className="mt-4 grid gap-3">
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                checked={announcementActive}
                onChange={(event) => setAnnouncementActive(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-700"
              />
              <span className="text-sm font-medium text-slate-700">
                Navbar üstünde duyuru göster
              </span>
            </label>
            <textarea
              rows={4}
              value={announcementMessages}
              onChange={(event) => setAnnouncementMessages(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
              placeholder="Her satıra bir kampanya duyurusu yazın"
            />
            <input
              value={announcementHref}
              onChange={(event) => setAnnouncementHref(event.target.value)}
              placeholder="/magaza veya https://..."
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <select
              value={announcementTone}
              onChange={(event) =>
                setAnnouncementTone(event.target.value as "emerald" | "amber" | "slate")
              }
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm"
            >
              <option value="emerald">Yeşil / kurumsal</option>
              <option value="amber">Sarı / kampanya</option>
              <option value="slate">Koyu / premium</option>
            </select>
            <p className="text-xs leading-5 text-slate-500">
              Kampanya pasifse veya mesaj yoksa üst şerit otomatik gizlenir.
            </p>
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
