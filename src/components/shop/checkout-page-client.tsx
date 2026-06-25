"use client";

import {
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Truck
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { CheckoutEmptyCartPanel, CheckoutLoadingPanel } from "@/components/shop/checkout-empty-cart-panel";
import { CheckoutOrderSummary } from "@/components/shop/checkout-order-summary";
import { CheckoutResultPanel } from "@/components/shop/checkout-result-panel";
import { CheckoutStatusSummary } from "@/components/shop/checkout-status-summary";
import { PaytrIframePanel } from "@/components/shop/paytr-iframe-panel";
import {
  enrichCartItems,
  getEnrichedCartSubtotalKurus,
  getEnrichedCartTaxKurus,
  getEnrichedCartTotalKurus
} from "@/lib/cart";
import { trackConversionEvent } from "@/lib/conversion-events";
import {
  PAYTR_CHECKOUT_CLIENT_VERSION,
  PAYTR_CHECKOUT_VERSION_HEADER
} from "@/lib/paytr-checkout-contract";
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

type PaytrIframeTokenResponse = {
  ok: boolean;
  iframeToken?: string;
  paymentFlow?: "iframe" | "link";
  paymentUrl?: string;
  merchantOid?: string;
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

function normalizePhoneForPayment(value: string) {
  const compact = value.trim().replace(/[^\d+]/g, "");
  const plusSafe = compact.startsWith("+")
    ? `+${compact.slice(1).replace(/\D/g, "")}`
    : compact.replace(/\D/g, "");

  return plusSafe.slice(0, 20);
}

function isValidCheckoutEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getTrustedPaytrPaymentUrl(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return url.origin === "https://www.paytr.com" && url.pathname.startsWith("/link/")
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function getCheckoutValidationError({
  draft,
  agreementAccepted,
  itemCount
}: {
  draft: CheckoutDraft;
  agreementAccepted: boolean;
  itemCount: number;
}) {
  if (itemCount < 1) {
    return "Sepetinizde ödeme yapılacak ürün bulunamadı.";
  }

  if (draft.fullName.trim().length < 2) {
    return "Ad soyad bilgisini en az 2 karakter olacak şekilde girin.";
  }

  if (!isValidCheckoutEmail(draft.email)) {
    return "Geçerli bir e-posta adresi girin.";
  }

  if (normalizePhoneForPayment(draft.phone).replace(/\D/g, "").length < 10) {
    return "Telefon numarası en az 10 rakam içermelidir.";
  }

  if (!draft.city.trim()) {
    return "Teslimat ili bilgisini girin.";
  }

  if (draft.address.trim().length < 5) {
    return "Açık adresi en az 5 karakter olacak şekilde girin.";
  }

  if (!agreementAccepted) {
    return "Ödeme ve sipariş bilgileri onay kutusunu işaretleyin.";
  }

  return null;
}

function getSubmittedCheckoutDraft(
  form: HTMLFormElement,
  fallbackDraft: CheckoutDraft
) {
  const formData = new FormData(form);
  const readField = (name: keyof CheckoutDraft) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : fallbackDraft[name];
  };

  return {
    draft: {
      fullName: readField("fullName"),
      email: readField("email"),
      phone: readField("phone"),
      city: readField("city"),
      district: readField("district"),
      address: readField("address"),
      deliveryNote: readField("deliveryNote")
    },
    agreementAccepted: formData.get("agreementAccepted") === "yes"
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
  const [iframeToken, setIframeToken] = useState<string | null>(null);
  const [merchantOid, setMerchantOid] = useState<string | null>(initialMerchantOid ?? null);
  const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const returnEventTrackedRef = useRef(false);
  const abandonIntentTrackedRef = useRef(false);
  const trackedOrderStatusRef = useRef<string | null>(null);
  const cartIntentFingerprint = `${draft.email}|${totalKurus}|${items
    .map((item) => `${item.productId}:${item.quantity}:${item.cableOption}`)
    .join("|")}`;
  const checkoutValidationError = getCheckoutValidationError({
    draft,
    agreementAccepted,
    itemCount: items.length
  });
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
    if (returnEventTrackedRef.current || !initialStatus) {
      return;
    }

    const normalizedStatus = initialStatus.toLowerCase();

    if (normalizedStatus !== "success" && normalizedStatus !== "failed") {
      return;
    }

    returnEventTrackedRef.current = true;
    trackConversionEvent(
      normalizedStatus === "success" ? "paytr_return_success" : "paytr_return_failed",
      {
        merchantOid: initialMerchantOid ?? merchantOid ?? null,
        source: "return_url"
      }
    );
  }, [initialMerchantOid, initialStatus, merchantOid]);

  useEffect(() => {
    if (
      !isHydrated ||
      items.length === 0 ||
      merchantOid ||
      hasPaidOrderStatus ||
      hasTerminalOrderStatus
    ) {
      return;
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "hidden" || abandonIntentTrackedRef.current) {
        return;
      }

      const hasEmail = isValidCheckoutEmail(draft.email);
      const hasPhone = normalizePhoneForPayment(draft.phone).replace(/\D/g, "").length >= 10;

      if (!hasEmail && !hasPhone) {
        return;
      }

      abandonIntentTrackedRef.current = true;
      trackConversionEvent("checkout_abandon_intent", {
        itemCount: items.length,
        totalKurus,
        city: draft.city || null,
        hasEmail,
        hasPhone
      });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    draft.city,
    draft.email,
    draft.phone,
    hasPaidOrderStatus,
    hasTerminalOrderStatus,
    isHydrated,
    items.length,
    merchantOid,
    totalKurus
  ]);

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

          const statusFingerprint = [
            targetMerchantOid,
            result.orderStatus,
            result.paymentStatus,
            result.transactionStatus ?? ""
          ].join(":");

          if (trackedOrderStatusRef.current !== statusFingerprint) {
            trackedOrderStatusRef.current = statusFingerprint;
            trackConversionEvent("order_status_poll", {
              merchantOid: targetMerchantOid,
              orderStatus: result.orderStatus,
              paymentStatus: result.paymentStatus,
              transactionStatus: result.transactionStatus
            });
          }
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

  function getPaytrCheckoutPayload(checkoutDraft: CheckoutDraft) {
    const addressParts = [
      checkoutDraft.address.trim(),
      checkoutDraft.district.trim(),
      checkoutDraft.city.trim(),
      checkoutDraft.deliveryNote.trim()
        ? `Not: ${checkoutDraft.deliveryNote.trim()}`
        : ""
    ].filter(Boolean);

    return {
      email: checkoutDraft.email.trim(),
      userName: checkoutDraft.fullName.trim(),
      userAddress: addressParts.join(", "),
      userPhone: normalizePhoneForPayment(checkoutDraft.phone),
      items: items.map((item) => ({
        productId: item.productId,
        cableOption: item.cableOption.trim() || "Standart",
        quantity: item.quantity
      }))
    };
  }

  async function handlePrepareIframePayment(form: HTMLFormElement) {
    const submitted = getSubmittedCheckoutDraft(form, draft);
    setDraft(submitted.draft);
    setAgreementAccepted(submitted.agreementAccepted);
    const infoError = getCheckoutValidationError({
      draft: submitted.draft,
      agreementAccepted: submitted.agreementAccepted,
      itemCount: items.length
    });

    if (infoError) {
      setError(infoError);
      trackConversionEvent("checkout_validation_error", {
        area: "checkout_info",
        message: infoError,
        itemCount: items.length,
        totalKurus,
        city: submitted.draft.city || null
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setOrderStatus(null);
      setIframeToken(null);
      trackConversionEvent("checkout_start", {
        itemCount: items.length,
        totalKurus,
        city: submitted.draft.city,
        hasDeliveryNote: Boolean(submitted.draft.deliveryNote.trim())
      });
      trackConversionEvent("checkout_paytr_submit", {
        itemCount: items.length,
        totalKurus,
        city: submitted.draft.city,
        flow: "auto"
      });

      const response = await fetch("/api/paytr/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [PAYTR_CHECKOUT_VERSION_HEADER]: PAYTR_CHECKOUT_CLIENT_VERSION
        },
        body: JSON.stringify(getPaytrCheckoutPayload(submitted.draft))
      });

      const result = await readCheckoutApiResponse<PaytrIframeTokenResponse>(
        response,
        "PayTR güvenli ödeme ekranı hazırlanamadı. Lütfen tekrar deneyin."
      );

      const paymentUrl = getTrustedPaytrPaymentUrl(result.paymentUrl);

      if (
        !response.ok ||
        !result.ok ||
        !result.merchantOid ||
        (!result.iframeToken && !paymentUrl)
      ) {
        throw new Error(result.message || "PayTR güvenli ödeme ekranı hazırlanamadı.");
      }

      setMerchantOid(result.merchantOid);
      window.sessionStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, result.merchantOid);

      if (paymentUrl) {
        window.location.assign(paymentUrl);
        return;
      }

      setIframeToken(result.iframeToken ?? null);
      window.requestAnimationFrame(() => {
        document.getElementById("paytr-payment-frame")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
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

    if (isSubmitting || iframeToken) {
      return;
    }

    void handlePrepareIframePayment(event.currentTarget);
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
      <div className="checkout-command-center rounded-lg border border-white/80 bg-white/82 p-4 shadow-[0_24px_80px_rgba(6,51,38,0.10)] backdrop-blur-xl sm:p-6 lg:p-8">
        <header className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-primary">
              PayTR uyumlu güvenli ödeme
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-normal text-on-surface sm:text-5xl">
              Siparişi doğrulayın, kartı PayTR ile güvenli onaylayın.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
              İletişim, adres ve sepet tutarı kontrol edilir; kart doğrulaması doğrudan PayTR
              güvenli ödeme akışına gönderilir.
            </p>
          </div>

          <div className="grid gap-2 rounded-lg border border-primary/12 bg-primary/6 p-3 sm:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-lg bg-white/78 p-3">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="mt-2 text-sm font-bold text-on-surface">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </header>

        <ol className="checkout-step-grid mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ödeme adımları">
          {checkoutSteps.map((step, index) => (
            <li
              key={step.title}
              className={`rounded-lg border p-4 ${
                index <= 3
                  ? "border-primary/25 bg-primary/7"
                  : "border-outline-variant/35 bg-white/78"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-normal text-primary">
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
        <section className="mt-6 rounded-lg border border-primary/15 bg-white/86 p-5 shadow-[0_16px_50px_rgba(6,51,38,0.08)] backdrop-blur-xl">
          <p className="text-sm font-bold uppercase tracking-normal text-primary">
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
            noValidate
            className="rounded-lg border border-white/80 bg-white/88 p-4 shadow-[0_24px_80px_rgba(6,51,38,0.10)] backdrop-blur-xl sm:p-6 lg:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-normal text-primary">
                  İletişim ve adres
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-normal text-on-surface">
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
                  name="fullName"
                  autoComplete="name"
                  value={draft.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="min-h-12 rounded-lg border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-on-surface">E-posta</span>
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={draft.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="min-h-12 rounded-lg border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-on-surface">Telefon</span>
                <input
                  required
                  name="phone"
                  aria-describedby="checkout-phone-help"
                  autoComplete="tel"
                  inputMode="tel"
                  value={draft.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="min-h-12 rounded-lg border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
                <span id="checkout-phone-help" className="text-xs leading-5 text-on-surface-variant">
                  Kargo ve kurulum planı için kullanılır.
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-on-surface">İl</span>
                <input
                  required
                  name="city"
                  autoComplete="address-level1"
                  value={draft.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  className="min-h-12 rounded-lg border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
                <span className="text-xs leading-5 text-on-surface-variant">
                  Ürün kargosu Türkiye geneline planlanır.
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-on-surface">İlçe</span>
                <input
                  name="district"
                  autoComplete="address-level2"
                  value={draft.district}
                  onChange={(event) => updateField("district", event.target.value)}
                  className="min-h-12 rounded-lg border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-on-surface">Teslimat notu</span>
                <input
                  name="deliveryNote"
                  autoComplete="off"
                  value={draft.deliveryNote}
                  onChange={(event) => updateField("deliveryNote", event.target.value)}
                  placeholder="Site adı, daire, kurulum notu"
                  className="min-h-12 rounded-lg border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-on-surface">Açık adres</span>
                <textarea
                  required
                  name="address"
                  autoComplete="street-address"
                  rows={4}
                  value={draft.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  className="rounded-lg border border-outline-variant/45 bg-white px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                />
              </label>
            </fieldset>

            <section className="checkout-payment-card mt-6 rounded-lg border border-primary/12 bg-linear-to-br from-primary/7 via-white to-secondary/8 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">
                    PayTR güvenli ödeme ekranı
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                    Bu form yalnızca teslimat bilgilerini hazırlar. Kart numarası,
                    son kullanma tarihi ve CVV bilgileri bir sonraki adımda yalnızca
                    PayTR iframe alanına girilir.
                  </p>
                </div>
              </div>

              <label className="mt-5 flex gap-3 rounded-lg bg-white/78 p-3 text-sm leading-6 text-on-surface-variant">
                <input
                  type="checkbox"
                  name="agreementAccepted"
                  value="yes"
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
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || Boolean(iframeToken)}
                className="checkout-pay-button mt-5 min-h-12 rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-[0_16px_38px_rgba(6,51,38,0.22)] transition hover:-translate-y-0.5 hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
              >
                {isSubmitting
                  ? "PayTR ekranı hazırlanıyor..."
                  : iframeToken
                    ? "PayTR ödeme ekranı açık"
                    : "PayTR ödeme ekranını aç"}
              </button>
              {!iframeToken && checkoutValidationError ? (
                <p className="mt-3 text-xs leading-5 text-on-surface-variant">
                  Butona bastığınızda eksik bilgiler açıkça gösterilir.
                </p>
              ) : null}
            </section>
          </form>

          <PaytrIframePanel iframeToken={iframeToken} />

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

          <div className="rounded-lg border border-white/80 bg-white/84 p-4 shadow-[0_16px_50px_rgba(6,51,38,0.08)] backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-on-surface">Teslimat ve kurulum notu</p>
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
