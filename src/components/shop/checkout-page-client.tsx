"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { formatPriceTRY } from "@/lib/format";

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

const CHECKOUT_STORAGE_KEY = "parkchargeev-checkout-draft-v1";
const ACTIVE_ORDER_STORAGE_KEY = "parkchargeev-active-order-v1";

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
    items,
    isHydrated,
    subtotalKurus,
    taxKurus,
    totalKurus,
    clearCart
  } = useCart();
  const [draft, setDraft] = useState<CheckoutDraft>(initialDraft);
  const [iframeToken, setIframeToken] = useState<string | null>(null);
  const [merchantOid, setMerchantOid] = useState<string | null>(
    initialMerchantOid ?? null
  );
  const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({
          email: draft.email,
          userName: draft.fullName,
          userAddress: `${draft.address}, ${draft.city}`,
          userPhone: draft.phone,
          paymentAmountKurus: totalKurus,
          items: items.map((item) => ({
            title: `${item.product.name} - ${item.cableOption}`,
            unitPrice: (item.product.priceKurus / 100).toFixed(2),
            quantity: item.quantity
          }))
        })
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
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="surface-card p-8">
          <p className="text-lg text-on-surface-variant">Ödeme adımı hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="surface-card p-10 text-center lg:p-14">
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
            Ödeme için ürün gerekli
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
            Sepetiniz boş olduğu için ödeme başlatılamıyor
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-on-surface-variant">
            Önce mağazadan ürün ekleyin, ardından bu sayfada müşteri bilgilerinizi tamamlayıp
            PayTR iframe akışını başlatın.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/magaza"
              className="rounded-2xl bg-primary px-7 py-4 text-base font-semibold text-white"
            >
              Mağazaya Git
            </Link>
            <Link
              href="/sepet"
              className="rounded-2xl border border-outline-variant/40 bg-surface-container-low px-7 py-4 text-base font-semibold text-on-surface"
            >
              Sepete Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px] lg:px-8">
      <Script src="https://www.paytr.com/js/iframeResizer.min.js" strategy="afterInteractive" />

      <section className="space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-secondary">
            256-bit güvenli ödeme
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
            Ödeme işlemi
          </h1>
          <p className="mt-4 text-lg text-on-surface-variant">
            Sepetinizdeki tutar ve müşteri bilgileriyle PayTR iframe akışını başlatın.
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
            {["Bilgiler", "Ödeme Hazırlığı", "PayTR iFrame"].map((step, index) => (
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
                value={draft.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-on-surface-variant">Telefon</span>
              <input
                required
                value={draft.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-on-surface-variant">Şehir</span>
              <input
                required
                value={draft.city}
                onChange={(event) => updateField("city", event.target.value)}
                className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
              />
            </label>
            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm text-on-surface-variant">Teslimat Adresi</span>
              <textarea
                required
                rows={4}
                value={draft.address}
                onChange={(event) => updateField("address", event.target.value)}
                className="rounded-3xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-[24px] bg-surface-container-low p-5">
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
                disabled={
                  isSubmitting ||
                  !draft.fullName ||
                  !draft.email ||
                  !draft.phone ||
                  !draft.city ||
                  !draft.address
                }
                className="rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Hazırlanıyor..." : "Ödemeyi Hazırla"}
              </button>
            </div>
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          </div>
        </div>

        <div className="surface-card p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
                Sipariş durumu
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-on-surface-variant">
                Callback işlendikten sonra sipariş durumu burada güncellenir.
              </p>
            </div>
            {isCheckingStatus ? (
              <span className="rounded-full bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface">
                Durum güncelleniyor
              </span>
            ) : null}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] bg-surface-container-low p-5">
              <p className="text-sm font-medium text-on-surface-variant">Merchant OID</p>
              <p className="mt-2 text-lg font-semibold text-on-surface">
                {merchantOid ?? "Henüz oluşturulmadı"}
              </p>
            </div>
            <div className="rounded-[24px] bg-surface-container-low p-5">
              <p className="text-sm font-medium text-on-surface-variant">Sipariş durumu</p>
              <p className="mt-2 text-lg font-semibold text-on-surface">
                {orderStatus?.orderStatus ?? "Hazırlanıyor"}
              </p>
            </div>
            <div className="rounded-[24px] bg-surface-container-low p-5">
              <p className="text-sm font-medium text-on-surface-variant">Ödeme durumu</p>
              <p className="mt-2 text-lg font-semibold text-on-surface">
                {orderStatus?.paymentStatus ?? "Bekleniyor"}
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            PayTR iFrame alanı
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-on-surface-variant">
            Güvenli ödeme formu sadece başarılı iframe token alındıktan sonra yüklenir.
          </p>
          {iframeToken ? (
            <div className="mt-8 overflow-hidden rounded-[28px] border border-outline-variant/35 bg-white">
              <iframe
                src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                id="paytriframe"
                frameBorder="0"
                scrolling="no"
                title="PayTR ödeme formu"
                className="min-h-[640px] w-full"
              />
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-dashed border-primary/35 bg-linear-to-br from-primary/6 via-white to-secondary/8 p-10 text-center">
              <p className="text-lg font-semibold text-on-surface">
                Ödeme formu hazırlanmayı bekliyor
              </p>
              <p className="mt-3 text-sm text-on-surface-variant">
                Bilgileri tamamlayıp “Ödemeyi Hazırla” butonuna bastığınızda güvenli iframe
                bu alana yerleşir.
              </p>
            </div>
          )}
        </div>
      </section>

      <aside className="surface-card h-fit p-8">
        <h2 className="text-4xl font-black tracking-[-0.07em] text-on-surface">
          Sipariş Özeti
        </h2>
        <div className="mt-6 space-y-4 text-base">
          {items.map((item) => (
            <div
              key={`${item.product.id}-${item.cableOption}`}
              className="rounded-[22px] bg-surface-container-low p-4"
            >
              <p className="font-semibold text-on-surface">{item.product.name}</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {item.cableOption} · {item.quantity} adet
              </p>
              <p className="mt-3 font-semibold text-primary">
                {formatPriceTRY(item.lineTotalKurus)}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-between text-on-surface-variant">
            <span>Ara Toplam</span>
            <span>{formatPriceTRY(subtotalKurus)}</span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant">
            <span>Kargo Tutarı</span>
            <span>₺0</span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant">
            <span>KDV (%20)</span>
            <span>{formatPriceTRY(taxKurus)}</span>
          </div>
        </div>
        <div className="mt-6 border-t border-outline-variant/35 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-on-surface">Ödenecek Tutar</span>
            <span className="text-4xl font-black tracking-[-0.06em] text-primary">
              {formatPriceTRY(totalKurus)}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
