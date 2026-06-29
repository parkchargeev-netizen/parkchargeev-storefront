"use client";

import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";

type FormState = {
  isSubmitting: boolean;
  message: string | null;
};

function useOperationForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>({ isSubmitting: false, message: null });

  async function submit(endpoint: string, payload: Record<string, unknown>, method = "POST") {
    setState({ isSubmitting: true, message: null });

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json().catch(() => ({ ok: false }))) as {
        ok?: boolean;
        message?: string;
      };

      setState({
        isSubmitting: false,
        message: response.ok && data.ok ? "İşlem kaydedildi." : data.message ?? "İşlem başarısız."
      });

      if (response.ok && data.ok) {
        router.refresh();
      }
    } catch {
      setState({ isSubmitting: false, message: "Sunucuya ulaşılamadı." });
    }
  }

  return { ...state, submit };
}

function getFormValue(form: HTMLFormElement, name: string) {
  const value = new FormData(form).get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalNumber(form: HTMLFormElement, name: string) {
  const value = getFormValue(form, name);
  return value ? Number(value) : undefined;
}

function SubmitButton({ isSubmitting, label }: { isSubmitting: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? "Kaydediliyor..." : label}
    </button>
  );
}

function ExampleNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
      <p className="font-bold">{title}</p>
      <div className="mt-1 leading-6 text-emerald-900/85">{children}</div>
    </div>
  );
}

export function BannerForm() {
  const { isSubmitting, message, submit } = useOperationForm();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    void submit("/api/admin/banners", {
      placement: getFormValue(form, "placement") || "home",
      title: getFormValue(form, "title"),
      subtitle: getFormValue(form, "subtitle"),
      imageUrl: getFormValue(form, "imageUrl"),
      ctaLabel: getFormValue(form, "ctaLabel"),
      ctaHref: getFormValue(form, "ctaHref"),
      status: getFormValue(form, "status") || "draft",
      sortOrder: getOptionalNumber(form, "sortOrder") ?? 0
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-bold text-slate-950">Banner ekle</p>
      <ExampleNote title="Örnek banner">
        Başlık: Ev ve işletmeler için akıllı şarj çözümleri | Yerleşim: home_hero |
        Görsel URL: /images/home/hero-charger.jpg | Buton: Mağazayı incele -&gt; /magaza
      </ExampleNote>
      <input name="title" required placeholder="Ev ve işletmeler için akıllı şarj çözümleri" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <textarea name="subtitle" placeholder="AC/DC şarj cihazları, kurulum ve teknik destek tek merkezde." className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <div className="grid gap-3 md:grid-cols-2">
        <input name="placement" defaultValue="home" placeholder="home, home_hero, store_top" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select name="status" defaultValue="draft" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="draft">Taslak</option>
          <option value="active">Aktif</option>
          <option value="archived">Arşiv</option>
        </select>
        <input name="imageUrl" placeholder="/images/home/hero-charger.jpg veya https://..." className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="sortOrder" type="number" min="0" defaultValue="0" placeholder="Sıra: 0 önce görünür" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="ctaLabel" placeholder="Mağazayı incele" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="ctaHref" placeholder="/magaza" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <SubmitButton isSubmitting={isSubmitting} label="Banner kaydet" />
    </form>
  );
}

export function CampaignForm() {
  const { isSubmitting, message, submit } = useOperationForm();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    void submit("/api/admin/campaigns", {
      name: getFormValue(form, "name"),
      slug: getFormValue(form, "slug"),
      description: getFormValue(form, "description"),
      status: getFormValue(form, "status") || "draft",
      discountType: getFormValue(form, "discountType") || "percent",
      discountValue: getOptionalNumber(form, "discountValue") ?? 0,
      productIds: getFormValue(form, "productIds").split(",").map((item) => item.trim()).filter(Boolean),
      categoryIds: getFormValue(form, "categoryIds").split(",").map((item) => item.trim()).filter(Boolean)
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-bold text-slate-950">Kampanya ekle</p>
      <ExampleNote title="Örnek kampanya">
        Yüzde: Yaz fırsatı, slug: yaz-firsati, indirim: %10 | Tutar: Kablo indirimi,
        slug: kablo-indirimi, indirim: 1500 TL. Ürün/kategori ID alanları virgül ile ayrılır.
      </ExampleNote>
      <input name="name" required placeholder="Yaz fırsatı" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <textarea name="description" placeholder="Seçili şarj cihazlarında yaz dönemine özel indirim." className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <div className="grid gap-3 md:grid-cols-2">
        <input name="slug" placeholder="yaz-firsati" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select name="status" defaultValue="draft" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="draft">Taslak</option>
          <option value="active">Aktif</option>
          <option value="archived">Arşiv</option>
        </select>
        <select name="discountType" defaultValue="percent" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="percent">Yüzde</option>
          <option value="amount">Tutar</option>
        </select>
        <input name="discountValue" type="number" min="0" defaultValue="0" placeholder="10 veya 1500" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="productIds" placeholder="Ürün ID listesi: id-1, id-2" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="categoryIds" placeholder="Kategori ID listesi: cat-1, cat-2" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <SubmitButton isSubmitting={isSubmitting} label="Kampanya kaydet" />
    </form>
  );
}

export function MerchandisingSlotForm() {
  const { isSubmitting, message, submit } = useOperationForm();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    void submit("/api/admin/merchandising", {
      slotKey: getFormValue(form, "slotKey") || "home_featured",
      title: getFormValue(form, "title"),
      productId: getFormValue(form, "productId") || null,
      sortOrder: getOptionalNumber(form, "sortOrder") ?? 0,
      isActive: getFormValue(form, "isActive") === "true"
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-bold text-slate-950">Vitrin ürünü ekle</p>
      <ExampleNote title="Örnek vitrin slotu">
        Slot: home_featured veya store_featured | Başlık: En çok tercih edilenler |
        Ürün ID: vitrinde gösterilecek ürün | Sıra: küçük sayı önce gelir.
      </ExampleNote>
      <div className="grid gap-3 md:grid-cols-2">
        <input name="slotKey" defaultValue="home_featured" placeholder="home_featured, store_featured" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="title" placeholder="En çok tercih edilenler" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="productId" placeholder="Ürün ID" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="sortOrder" type="number" min="0" defaultValue="0" placeholder="Sıra: 0 önce görünür" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select name="isActive" defaultValue="true" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="true">Aktif</option>
          <option value="false">Pasif</option>
        </select>
      </div>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <SubmitButton isSubmitting={isSubmitting} label="Vitrin slotu kaydet" />
    </form>
  );
}

export function InventoryAdjustmentForm() {
  const { isSubmitting, message, submit } = useOperationForm();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    void submit("/api/admin/inventory", {
      variantId: getFormValue(form, "variantId"),
      quantityAfter: getOptionalNumber(form, "quantityAfter") ?? 0,
      note: getFormValue(form, "note")
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-bold text-slate-950">Manuel stok düzeltmesi</p>
      <input name="variantId" required placeholder="Varyant ID" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="quantityAfter" required type="number" min="0" placeholder="Yeni stok" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <textarea name="note" placeholder="Not" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      <SubmitButton isSubmitting={isSubmitting} label="Stok düzelt" />
    </form>
  );
}

export function NotificationMarkButton({ ids, isRead }: { ids: string[]; isRead: boolean }) {
  const { isSubmitting, message, submit } = useOperationForm();

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={isSubmitting || ids.length === 0}
        onClick={() => submit("/api/admin/notifications", { ids, isRead }, "PATCH")}
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
      >
        {isRead ? "Okundu işaretle" : "Okunmadı işaretle"}
      </button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}

export function ArchiveOperationButton({
  endpoint,
  id,
  label = "Arsivle",
  confirmation = "Bu kayit arsivlensin mi?",
  mode = "archive"
}: {
  endpoint: string;
  id: string;
  label?: string;
  confirmation?: string;
  mode?: "archive" | "delete";
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    if (!window.confirm(confirmation)) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const params = new URLSearchParams({ id });

      if (mode === "delete") {
        params.set("mode", "delete");
      }

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        method: "DELETE"
      });
      const data = (await response.json().catch(() => ({ ok: false }))) as {
        ok?: boolean;
        message?: string;
      };

      setMessage(response.ok && data.ok ? "Kayit guncellendi." : data.message ?? "Islem basarisiz.");

      if (response.ok && data.ok) {
        router.refresh();
      }
    } catch {
      setMessage("Sunucuya ulasilamadi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-3 grid gap-2">
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onClick}
        className={
          mode === "delete"
            ? "rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            : "rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {isSubmitting ? "Isleniyor..." : label}
      </button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
