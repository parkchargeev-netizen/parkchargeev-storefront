"use client";

import {
  CreditCard,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Truck
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { CheckoutEmptyCartPanel, CheckoutLoadingPanel } from "@/components/shop/checkout-empty-cart-panel";
import { CheckoutOrderSummary } from "@/components/shop/checkout-order-summary";
import { CheckoutResultPanel } from "@/components/shop/checkout-result-panel";
import { CheckoutStatusSummary } from "@/components/shop/checkout-status-summary";
import {
  enrichCartItems,
  getEnrichedCartSubtotalKurus,
  getEnrichedCartTaxKurus,
  getEnrichedCartTotalKurus
} from "@/lib/cart";
import { trackConversionEvent } from "@/lib/conversion-events";
import { serviceCoverageSummary } from "@/lib/service-coverage";

type CheckoutPageClientProps = {
  initialStatus?: string;
  initialMerchantOid?: string;
};

type OrderStatusResponse = {
  ok: boolean;
  orderStatus: string;
  paymentStatus: string;
  transactionStatus: string | null;
};

type CheckoutDraft = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  deliveryNote: string;
};

type CheckoutApiResponse<T extends object> = T & {
  ok?: boolean;
  message?: string;
};

type PaytrDirectFormResponse = {
  ok: boolean;
  action?: string;
  merchantOid?: string;
  fields?: Record<string, string>;
  message?: string;
};

const CHECKOUT_STORAGE_KEY = "parkchargeev-checkout-draft-v2";
const LEGACY_CHECKOUT_STORAGE_KEY = "parkchargeev-checkout-draft-v1";
const ACTIVE_ORDER_STORAGE_KEY = "parkchargeev-active-order-v1";
const CART_INTENT_STORAGE_KEY = "parkchargeev-cart-intent-v1";

const initialDraft: CheckoutDraft = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  district: "",
  address: "",
  deliveryNote: ""
};

const checkoutSteps = [
  {
    title: "Sepet",
    detail: "Ürün ve tutar doğrulandı"
  },
  {
    title: "İletişim",
    detail: "Fatura ve teslimat bilgisi"
  },
  {
    title: "Adres",
    detail: "Kargo ve kurulum notu"
  },
  {
    title: "PayTR",
    detail: "Kart doğrulaması PayTR'ye gider"
  }
] as const;

const trustItems = [
  {
    icon: ShieldCheck,
    title: "PayTR güvencesi",
    detail: "Kart bilgisi doğrudan PayTR'ye gönderilir."
  },
  {
    icon: Truck,
    title: "81 il kargo",
    detail: serviceCoverageSummary.shipping
  },
  {
    icon: LockKeyhole,
    title: "Doğrulanmış tutar",
    detail: "Tutar sunucuda yeniden hesaplanır."
  }
] as const;

function isPaidOrderStatus(orderStatus: OrderStatusResponse | null) {
  return orderStatus?.paymentStatus === "paid";
}

function isTerminalOrderStatus(orderStatus: OrderStatusResponse | null) {
  return (
    orderStatus?.paymentStatus === "paid" ||
    orderStatus?.paymentStatus === "failed" ||
    orderStatus?.orderStatus === "failed" ||
    orderStatus?.orderStatus === "cancelled" ||
    orderStatus?.orderStatus === "refunded"
  );
}

function normalizeDraft(value: unknown): CheckoutDraft {
  if (!value || typeof value !== "object") {
    return initialDraft;
  }

  return {
    ...initialDraft,
    ...(value as Partial<CheckoutDraft>)
  };
}

async function readCheckoutApiResponse<T extends object>(
  response: Response,
  fallbackMessage: string
): Promise<CheckoutApiResponse<T>> {
  const rawBody = await response.text();

  if (!rawBody.trim()) {
    return {
      ok: false,
      message: fallbackMessage
    } as CheckoutApiResponse<T>;
  }

  try {
    return JSON.parse(rawBody) as CheckoutApiResponse<T>;
  } catch {
    return {
      ok: false,
      message: fallbackMessage
    } as CheckoutApiResponse<T>;
  }
}

export function CheckoutPageClient({
  initialStatus,
  initialMerchantOid
}: CheckoutPageClientProps) {
  const { items: cartItems, isHydrated, clearCart } = useCart();
  const items = enrichCartItems(cartItems);
  const subtotalKurus = getEnrichedCartSubtotalKurus(items);
  const taxKurus = getEnrichedCartTaxKurus(items);
  const totalKurus = getEnrichedCartTotalKurus(items);
  const [draft, setDraft] = useState<CheckoutDraft>(initialDraft);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [merchantOid, setMerchantOid] = useState<string | null>(initialMerchantOid ?? null);
  const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cartIntentFingerprint = `${draft.email}|${totalKurus}|${items
    .map((item) => `${item.productId}:${item.quantity}:${item.cableOption}`)
    .join("|")}`;
  const isCheckoutInfoComplete = Boolean(
    draft.fullName.trim() &&
      draft.email.includes("@") &&
      draft.phone.trim() &&
      draft.city.trim() &&
      draft.address.trim() &&
      agreementAccepted
  );
  const hasPaidOrderStatus = isPaidOrderStatus(orderStatus);
  const hasTerminalOrderStatus = isTerminalOrderStatus(orderStatus);

  useEffect(() => {
    try {
      const rawDraft =
        window.localStorage.getItem(CHECKOUT_STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_CHECKOUT_STORAGE_KEY);

      if (rawDraft) {
        setDraft(normalizeDraft(JSON.parse(rawDraft)));
      }
    } catch {
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_CHECKOUT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    if (!isHydrated || items.length === 0 || !draft.email.includes("@")) {
      return;
    }

    if (window.sessionStorage.getItem(CART_INTENT_STORAGE_KEY) === cartIntentFingerprint) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetch("/api/cart-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: draft.email,
          fullName: draft.fullName,
          phone: draft.phone,
          totalKurus,
          items: items.map((item) => ({
            title: `${item.product.name} - ${item.cableOption}`,
            unitPrice: (item.unitPriceKurus / 100).toFixed(2),
            quantity: item.quantity
          }))
        })
      })
        .then((response) => {
          if (response.ok) {
            window.sessionStorage.setItem(CART_INTENT_STORAGE_KEY, cartIntentFingerprint);
          }
        })
        .catch(() => undefined);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [cartIntentFingerprint, draft.email, draft.fullName, draft.phone, isHydrated, items, totalKurus]);

  useEffect(() => {
    if (!merchantOid || hasTerminalOrderStatus) {
      return;
    }

    let isCancelled = false;

    async function loadOrderStatus(targetMerchantOid: string) {
      try {
        setIsCheckingStatus(true);
        const response = await fetch(`/api/orders/${targetMerchantOid}`, {
          cache: "no-store"
        });
        const result = await readCheckoutApiResponse<OrderStatusResponse>(
          response,
          "Sipariş durumu şu anda okunamadı. Lütfen birkaç saniye sonra tekrar deneyin."
        );

        if (!response.ok || !result.ok) {
          throw new Error(result.message || "Sipariş durumu alınamadı.");
        }

        if (!isCancelled) {
          setError(null);
          setOrderStatus(result);
        }
      } catch (statusError) {
        if (!isCancelled) {
          setError(
            statusError instanceof Error
              ? statusError.message
              : "Sipariş durumu alınırken beklenmeyen bir hata oluştu."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsCheckingStatus(false);
        }
      }
    }

    void loadOrderStatus(merchantOid);

    const interval = window.setInterval(() => {
      void loadOrderStatus(merchantOid);
    }, 5000);

    return () => {
      isCancelled = true;
      window.clearInterval(interval);
    };
  }, [hasTerminalOrderStatus, merchantOid]);

  useEffect(() => {
    if (
      hasPaidOrderStatus &&
      merchantOid &&
      window.sessionStorage.getItem(ACTIVE_ORDER_STORAGE_KEY) === merchantOid
    ) {
      clearCart();
      window.sessionStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
    }
  }, [clearCart, hasPaidOrderStatus, merchantOid]);

  function updateField<Key extends keyof CheckoutDraft>(key: Key, value: CheckoutDraft[Key]) {
    setDraft((current) => ({
      ...current,
      [key]: value
    }));
  }

  function getPaytrCheckoutPayload() {
    const addressParts = [
      draft.address.trim(),
      draft.district.trim(),
      draft.city.trim(),
      draft.deliveryNote.trim() ? `Not: ${draft.deliveryNote.trim()}` : ""
    ].filter(Boolean);

    return {
      email: draft.email.trim(),
      userName: draft.fullName.trim(),
      userAddress: addressParts.join(", "),
      userPhone: draft.phone.trim(),
      items: items.map((item) => ({
        productId: item.productId,
        cableOption: item.cableOption,
        quantity: item.quantity
      }))
    };
  }

  function getNormalizedCardData(form: HTMLFormElement) {
    const formData = new FormData(form);
    const cardNumber = String(formData.get("card_number") ?? "").replace(/\D/g, "");
    const expiryMonth = String(formData.get("expiry_month") ?? "").padStart(2, "0");
    const expiryYear = String(formData.get("expiry_year") ?? "").replace(/\D/g, "").slice(-2);
    const cvv = String(formData.get("cvv") ?? "").replace(/\D/g, "");

    return {
      cc_owner: String(formData.get("cc_owner") ?? "").trim(),
      card_number: cardNumber,
      expiry_month: expiryMonth,
      expiry_year: expiryYear,
      cvv
    };
  }

  function isValidCardNumber(cardNumber: string) {
    if (!/^\d{13,19}$/.test(cardNumber)) {
      return false;
    }

    let sum = 0;
    let shouldDouble = false;

    for (let index = cardNumber.length - 1; index >= 0; index -= 1) {
      let digit = Number(cardNumber[index]);

      if (shouldDouble) {
        digit *= 2;

        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  function validateCardData(cardData: ReturnType<typeof getNormalizedCardData>) {
    if (cardData.cc_owner.length < 3) {
      return "Kart sahibi adını girin.";
    }

    if (!isValidCardNumber(cardData.card_number)) {
      return "Kart numarasını kontrol edin.";
    }

    if (!/^(0[1-9]|1[0-2])$/.test(cardData.expiry_month)) {
      return "Son kullanma ayını kontrol edin.";
    }

    if (!/^\d{2}$/.test(cardData.expiry_year)) {
      return "Son kullanma yılını iki haneli girin.";
    }

    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      return "CVV kodunu kontrol edin.";
    }

    return null;
  }

  function postCardDataToPaytr({
    action,
    cardData,
    fields
  }: {
    action: string;
    cardData: ReturnType<typeof getNormalizedCardData>;
    fields: Record<string, string>;
  }) {
    const form = document.createElement("form");
    form.action = action;
    form.method = "post";
    form.style.display = "none";

    const values = {
      ...fields,
      ...cardData
    };

    Object.entries(values).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  async function handlePrepareDirectPayment(form: HTMLFormElement) {
    const cardData = getNormalizedCardData(form);
    const cardError = validateCardData(cardData);

    if (cardError) {
      setError(cardError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setOrderStatus(null);
      trackConversionEvent("checkout_start", {
        itemCount: items.length,
        totalKurus,
        city: draft.city,
        hasDeliveryNote: Boolean(draft.deliveryNote.trim())
      });

      const response = await fetch("/api/paytr/direct-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(getPaytrCheckoutPayload())
      });

      const result = await readCheckoutApiResponse<PaytrDirectFormResponse>(
        response,
        "PayTR ödeme formu hazırlanamadı. Lütfen tekrar deneyin."
      );

      if (!response.ok || !result.ok || !result.action || !result.fields || !result.merchantOid) {
        throw new Error(result.message || "PayTR ödeme formu hazırlanamadı.");
      }

      setMerchantOid(result.merchantOid);
      window.sessionStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, result.merchantOid);
      postCardDataToPaytr({
        action: result.action,
        cardData,
        fields: result.fields
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Ödeme hazırlanırken beklenmeyen bir hata oluştu."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isCheckoutInfoComplete || isSubmitting) {
      return;
    }

    void handlePrepareDirectPayment(event.currentTarget);
  }

  if (!isHydrated) {
    return <CheckoutLoadingPanel />;
  }

  if (items.length === 0 && merchantOid) {
    return (
      <CheckoutResultPanel
        merchantOid={merchantOid}
        initialStatus={initialStatus}
        orderStatus={orderStatus}
        isCheckingStatus={isCheckingStatus}
        error={error}
      />
    );
  }

  if (items.length === 0) {
    return <CheckoutEmptyCartPanel />;
  }

  return (
    <main className="checkout-page mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="rounded-[32px] border border-white/80 bg-white/82 p-4 shadow-[0_24px_80px_rgba(6,51,38,0.10)] backdrop-blur-xl sm:p-6 lg:p-8">
        <header className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-primary">
              PayTR uyumlu güvenli ödeme
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.06em] text-on-surface sm:text-5xl">
              Siparişinizi doğrulayın, ödemeyi PayTR içinde tamamlayın.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
              ParkChargeEV yalnızca sipariş, iletişim ve teslimat bilgilerini alır. Kart numarası,
              son kullanma tarihi ve CVV bilgisi doğrudan PayTR güvenli ödeme servisine gönderilir.
            </p>
          </div>

          <div className="grid gap-2 rounded-[24px] border border-primary/12 bg-primary/6 p-3 sm:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[18px] bg-white/78 p-3">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="mt-2 text-sm font-black text-on-surface">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </header>

        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ödeme adımları">
          {checkoutSteps.map((step, index) => (
            <li
              key={step.title}
              className={`rounded-[22px] border p-4 ${
                index <= 3
                  ? "border-primary/25 bg-primary/7"
                  : "border-outline-variant/35 bg-white/78"
              }`}
            >
              <span className="text-xs font-black uppercase tracking-[0.24em] text-primary">
                Adım {index + 1}
              </span>
              <strong className="mt-2 block text-base text-on-surface">{step.title}</strong>
              <small className="mt-1 block text-xs leading-5 text-on-surface-variant">
                {step.detail}
              </small>
            </li>
          ))}
        </ol>
      </div>

      {initialStatus ? (
        <section className="mt-6 rounded-[28px] border border-primary/15 bg-white/86 p-5 shadow-[0_16px_50px_rgba(6,51,38,0.08)] backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-primary">
            PayTR dönüş bilgisi
          </p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Tarayıcı PayTR ekranından geri döndü. Kesin sonuç, PayTR callback doğrulaması ve
            aşağıdaki sipariş durumu ile takip edilir.
          </p>
        </section>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-[30px] border border-white/80 bg-white/88 p-4 shadow-[0_24px_80px_rgba(6,51,38,0.10)] backdrop-blur-xl sm:p-6 lg:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">
                  İletişim ve adres
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-on-surface">
                  Sipariş bilgileri
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
                  Bu bilgiler kargo, fatura ve gerekirse kurulum planlaması için kullanılır.
                </p>
              </div>

            </div>

            <fieldset disabled={isSubmitting} className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-on-surface">Ad Soyad</span>
                <input
                  required
                  autoComplete="name"
                  value={draft.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="min-h-12 rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-on-surface">E-posta</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={draft.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="min-h-12 rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-on-surface">Telefon</span>
                <input
                  required
                  aria-describedby="checkout-phone-help"
                  autoComplete="tel"
                  inputMode="tel"
                  value={draft.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="min-h-12 rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
                <span id="checkout-phone-help" className="text-xs leading-5 text-on-surface-variant">
                  Kargo ve kurulum planı için kullanılır.
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-on-surface">İl</span>
                <input
                  required
                  autoComplete="address-level1"
                  value={draft.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  className="min-h-12 rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
                <span className="text-xs leading-5 text-on-surface-variant">
                  Ürün kargosu Türkiye geneline planlanır.
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-on-surface">İlçe</span>
                <input
                  autoComplete="address-level2"
                  value={draft.district}
                  onChange={(event) => updateField("district", event.target.value)}
                  className="min-h-12 rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-on-surface">Teslimat notu</span>
                <input
                  autoComplete="off"
                  value={draft.deliveryNote}
                  onChange={(event) => updateField("deliveryNote", event.target.value)}
                  placeholder="Site adı, daire, kurulum notu"
                  className="min-h-12 rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-on-surface">Açık adres</span>
                <textarea
                  required
                  autoComplete="street-address"
                  rows={4}
                  value={draft.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  className="rounded-3xl border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
              </label>
            </fieldset>

            <section className="mt-6 rounded-[26px] border border-primary/12 bg-linear-to-br from-primary/7 via-white to-secondary/8 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
                    <CreditCard className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-on-surface">Kart bilgileri</h3>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                      Sipariş tutarı sunucuda yeniden hesaplanır. Kart bilgileri ParkChargeEV
                      API&apos;sine gönderilmez; doğrulama formu doğrudan PayTR&apos;ye POST edilir.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isCheckoutInfoComplete}
                  className="min-h-12 rounded-2xl bg-primary px-6 py-3 text-base font-black text-white shadow-[0_16px_38px_rgba(6,51,38,0.22)] transition hover:-translate-y-0.5 hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? "PayTR doğruluyor..." : "Kartı Doğrula ve Öde"}
                </button>
              </div>

              <fieldset disabled={isSubmitting} className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-semibold text-on-surface">Kart üzerindeki ad</span>
                  <input
                    required
                    name="cc_owner"
                    autoComplete="cc-name"
                    placeholder="Ad Soyad"
                    className="min-h-12 rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                  />
                </label>

                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-semibold text-on-surface">Kart numarası</span>
                  <input
                    required
                    name="card_number"
                    autoComplete="cc-number"
                    inputMode="numeric"
                    pattern="[0-9 ]{13,23}"
                    placeholder="0000 0000 0000 0000"
                    className="min-h-12 rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-on-surface">Ay</span>
                    <input
                      required
                      name="expiry_month"
                      autoComplete="cc-exp-month"
                      inputMode="numeric"
                      pattern="0?[1-9]|1[0-2]"
                      placeholder="AA"
                      className="min-h-12 rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-on-surface">Yıl</span>
                    <input
                      required
                      name="expiry_year"
                      autoComplete="cc-exp-year"
                      inputMode="numeric"
                      pattern="[0-9]{2,4}"
                      placeholder="YY"
                      className="min-h-12 rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-on-surface">CVV</span>
                  <input
                    required
                    name="cvv"
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    pattern="[0-9]{3,4}"
                    placeholder="000"
                    className="min-h-12 rounded-2xl border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                  />
                </label>
              </fieldset>

              <label className="mt-5 flex gap-3 rounded-2xl bg-white/78 p-3 text-sm leading-6 text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={agreementAccepted}
                  onChange={(event) => setAgreementAccepted(event.target.checked)}
                  disabled={isSubmitting}
                  className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span>
                  Sipariş bilgilerimin doğru olduğunu ve kart doğrulamasının PayTR güvenli ödeme
                  altyapısına gönderileceğini onaylıyorum.
                </span>
              </label>

              {error ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </p>
              ) : null}
            </section>
          </form>

          <CheckoutStatusSummary
            merchantOid={merchantOid}
            orderStatus={orderStatus}
            isCheckingStatus={isCheckingStatus}
          />

        </section>

        <aside className="space-y-4 lg:sticky lg:top-28">
          <CheckoutOrderSummary
            items={items}
            subtotalKurus={subtotalKurus}
            taxKurus={taxKurus}
            totalKurus={totalKurus}
          />

          <div className="rounded-[26px] border border-white/80 bg-white/84 p-4 shadow-[0_16px_50px_rgba(6,51,38,0.08)] backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-black text-on-surface">Teslimat ve kurulum notu</p>
                <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                  {serviceCoverageSummary.note}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
