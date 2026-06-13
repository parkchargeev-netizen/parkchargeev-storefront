"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import { CheckoutEmptyCartPanel, CheckoutLoadingPanel } from "@/components/shop/checkout-empty-cart-panel";
import { CheckoutOrderSummary } from "@/components/shop/checkout-order-summary";
import { CheckoutResultPanel } from "@/components/shop/checkout-result-panel";
import { CheckoutStatusSummary } from "@/components/shop/checkout-status-summary";
import { PaytrDirectPaymentPanel } from "@/components/shop/paytr-direct-payment-panel";
import { PaytrIframePanel } from "@/components/shop/paytr-iframe-panel";
import { useCart } from "@/components/providers/cart-provider";
import {
  enrichCartItems,
  getEnrichedCartSubtotalKurus,
  getEnrichedCartTaxKurus,
  getEnrichedCartTotalKurus
} from "@/lib/cart";
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
  address: string;
};

type PaymentMethod = "iframe" | "direct_api";

const CHECKOUT_STORAGE_KEY = "parkchargeev-checkout-draft-v1";
const ACTIVE_ORDER_STORAGE_KEY = "parkchargeev-active-order-v1";
const CART_INTENT_STORAGE_KEY = "parkchargeev-cart-intent-v1";

const initialDraft: CheckoutDraft = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  address: ""
};

export function CheckoutPageClient({
  initialStatus,
  initialMerchantOid
}: CheckoutPageClientProps) {
  const {
    items: cartItems,
    isHydrated,
    clearCart
  } = useCart();
  const items = enrichCartItems(cartItems);
  const subtotalKurus = getEnrichedCartSubtotalKurus(items);
  const taxKurus = getEnrichedCartTaxKurus(items);
  const totalKurus = getEnrichedCartTotalKurus(items);
  const [draft, setDraft] = useState<CheckoutDraft>(initialDraft);
  const [iframeToken, setIframeToken] = useState<string | null>(null);
  const [merchantOid, setMerchantOid] = useState<string | null>(
    initialMerchantOid ?? null
  );
  const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("iframe");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cartIntentFingerprint = `${draft.email}|${totalKurus}|${items
    .map((item) => `${item.productId}:${item.quantity}:${item.cableOption}`)
    .join("|")}`;
  const isCheckoutInfoComplete = Boolean(
    draft.fullName &&
      draft.email &&
      draft.phone &&
      draft.city &&
      draft.address
  );

  useEffect(() => {
    try {
      const rawDraft = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);

      if (rawDraft) {
        setDraft(JSON.parse(rawDraft) as CheckoutDraft);
      }
    } catch {
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
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
    if (!merchantOid) {
      return;
    }

    if (orderStatus?.orderStatus === "paid" || orderStatus?.orderStatus === "failed") {
      return;
    }

    let isCancelled = false;

    async function loadOrderStatus(targetMerchantOid: string) {
      try {
        setIsCheckingStatus(true);
        const response = await fetch(`/api/orders/${targetMerchantOid}`, {
          cache: "no-store"
        });
        const result = (await response.json()) as OrderStatusResponse & {
          message?: string;
        };

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
  }, [merchantOid, orderStatus?.orderStatus]);

  useEffect(() => {
    if (
      orderStatus?.orderStatus === "paid" &&
      merchantOid &&
      window.sessionStorage.getItem(ACTIVE_ORDER_STORAGE_KEY) === merchantOid
    ) {
      clearCart();
      window.sessionStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
    }
  }, [clearCart, merchantOid, orderStatus]);

  useEffect(() => {
    if (!iframeToken || typeof window === "undefined") {
      return;
    }

    const paytrWindow = window as Window & {
      iFrameResize?: (options: Record<string, never>, target: string) => void;
    };

    if (paytrWindow.iFrameResize) {
      paytrWindow.iFrameResize({}, "#paytriframe");
    }
  }, [iframeToken]);

  function updateField<Key extends keyof CheckoutDraft>(key: Key, value: CheckoutDraft[Key]) {
    setDraft((current) => ({
      ...current,
      [key]: value
    }));
  }

  function getPaytrCheckoutPayload() {
    return {
      email: draft.email,
      userName: draft.fullName,
      userAddress: `${draft.address}, ${draft.city}`,
      userPhone: draft.phone,
      items: items.map((item) => ({
        productId: item.productId,
        cableOption: item.cableOption,
        quantity: item.quantity
      }))
    };
  }

  function selectPaymentMethod(nextMethod: PaymentMethod) {
    setPaymentMethod(nextMethod);
    setError(null);

    if (nextMethod === "direct_api") {
      setIframeToken(null);
    }
  }

  function handleDirectPaymentStarted(nextMerchantOid: string) {
    setIframeToken(null);
    setOrderStatus(null);
    setMerchantOid(nextMerchantOid);
    window.sessionStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, nextMerchantOid);
  }

  async function handlePreparePayment() {
    try {
      setIsSubmitting(true);
      setError(null);
      setIframeToken(null);
      setOrderStatus(null);

      const response = await fetch("/api/paytr/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(getPaytrCheckoutPayload())
      });

      const result = (await response.json()) as {
        ok: boolean;
        iframeToken?: string;
        merchantOid?: string;
        message?: string;
      };

      if (!response.ok || !result.ok || !result.iframeToken || !result.merchantOid) {
        throw new Error(result.message || "Ödeme oturumu başlatılamadı.");
      }

      setIframeToken(result.iframeToken);
      setMerchantOid(result.merchantOid);
      window.sessionStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, result.merchantOid);
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
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1fr_360px] lg:px-8">
      {iframeToken ? (
        <Script src="https://www.paytr.com/js/iframeResizer.min.js" strategy="afterInteractive" />
      ) : null}

      <section className="space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-secondary">
            256-bit güvenli ödeme
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
            Ödeme işlemi
          </h1>
          <p className="mt-4 text-lg text-on-surface-variant">
            Sepetinizdeki tutar ve müşteri bilgileriyle PayTR güvenli ödeme akışını başlatın.
          </p>
        </header>

        {initialStatus ? (
          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              Yönlendirme bilgisi
            </p>
            <p className="mt-3 text-base leading-7 text-on-surface-variant">
              Tarayıcı sizi ödeme sağlayıcısından geri yönlendirdi. Kesin sipariş sonucu
              callback ile doğrulandığı için aşağıdaki durum kartı esas alınmalıdır.
            </p>
          </div>
        ) : null}

        <div className="surface-card p-8">
          <div className="grid gap-4 md:grid-cols-3">
            {["Bilgiler", "Ödeme Yöntemi", "PayTR Onayı"].map((step, index) => (
              <div
                key={step}
                className={`rounded-[24px] border px-5 py-5 ${
                  (iframeToken && index < 3) || (!iframeToken && index < 2)
                    ? "border-primary bg-surface-container-low"
                    : "border-outline-variant/40 bg-white"
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                  Adım {index + 1}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.05em] text-on-surface">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-on-surface-variant">Ad Soyad</span>
              <input
                required
                autoComplete="name"
                value={draft.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-on-surface-variant">E-posta</span>
              <input
                required
                type="email"
                autoComplete="email"
                value={draft.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-on-surface-variant">Telefon</span>
              <input
                required
                aria-describedby="checkout-phone-help"
                autoComplete="tel"
                inputMode="tel"
                value={draft.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
              />
              <span id="checkout-phone-help" className="text-xs leading-5 text-on-surface-variant">
                Kargo ve kurulum randevusu için kullanılır; pazarlama araması için kullanılmaz.
              </span>
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-on-surface-variant">Şehir</span>
              <input
                required
                autoComplete="address-level1"
                value={draft.city}
                onChange={(event) => updateField("city", event.target.value)}
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
              />
              <span className="text-xs leading-5 text-on-surface-variant">
                {serviceCoverageSummary.shipping}; {serviceCoverageSummary.installation}.
              </span>
            </label>
            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm text-on-surface-variant">Teslimat Adresi</span>
              <textarea
                required
                autoComplete="street-address"
                rows={4}
                value={draft.address}
                onChange={(event) => updateField("address", event.target.value)}
                className="rounded-3xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
              />
            </label>
          </div>

          <div className="mt-8 grid gap-4">
            <div className="flex flex-col gap-3 rounded-[24px] bg-surface-container-low p-5">
              <p className="text-lg font-bold text-on-surface">PayTR Ödeme Yöntemi</p>
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={paymentMethod === "iframe"}
                  onClick={() => selectPaymentMethod("iframe")}
                  className={`rounded-2xl border px-5 py-4 text-left transition ${
                    paymentMethod === "iframe"
                      ? "border-primary bg-white text-on-surface"
                      : "border-outline-variant/50 bg-transparent text-on-surface-variant"
                  }`}
                >
                  <span className="block text-base font-bold">PayTR iFrame</span>
                  <span className="mt-1 block text-sm">
                    Varsayılan hızlı akış; kart girişi PayTR güvenli alanında tamamlanır.
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={paymentMethod === "direct_api"}
                  onClick={() => selectPaymentMethod("direct_api")}
                  className={`rounded-2xl border px-5 py-4 text-left transition ${
                    paymentMethod === "direct_api"
                      ? "border-primary bg-white text-on-surface"
                      : "border-outline-variant/50 bg-transparent text-on-surface-variant"
                  }`}
                >
                  <span className="block text-base font-bold">Direkt API 3D Secure</span>
                  <span className="mt-1 block text-sm">
                    Kart formu sitede gösterilir, veriler bizim sunucuya uğramadan PayTR’a post edilir.
                  </span>
                </button>
              </div>
            </div>

            {paymentMethod === "iframe" ? (
              <div className="flex flex-col gap-4 rounded-[24px] bg-surface-container-low p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-on-surface">PayTR iFrame hazırlığı</p>
                    <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                      Siparişiniz veritabanında pending_payment olarak açılır, ardından güvenli
                      iframe token talebi yapılır.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handlePreparePayment()}
                    disabled={isSubmitting || !isCheckoutInfoComplete}
                    className="rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Hazırlanıyor..." : "Ödemeyi Hazırla"}
                  </button>
                </div>
                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
              </div>
            ) : (
              <PaytrDirectPaymentPanel
                customer={getPaytrCheckoutPayload()}
                disabled={!isCheckoutInfoComplete}
                onPaymentStarted={handleDirectPaymentStarted}
                onError={setError}
              />
            )}

            {paymentMethod === "direct_api" && error ? (
              <p className="text-sm font-medium text-red-600">{error}</p>
            ) : null}
          </div>
        </div>

        <CheckoutStatusSummary
          merchantOid={merchantOid}
          orderStatus={orderStatus}
          isCheckingStatus={isCheckingStatus}
        />

        <PaytrIframePanel iframeToken={iframeToken} />
      </section>

      <CheckoutOrderSummary
        items={items}
        subtotalKurus={subtotalKurus}
        taxKurus={taxKurus}
        totalKurus={totalKurus}
      />
    </div>
  );
}
