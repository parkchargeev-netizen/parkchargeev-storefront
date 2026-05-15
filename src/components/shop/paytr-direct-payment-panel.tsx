"use client";

import { useMemo, useState } from "react";

type PaytrDirectPaymentItem = {
  title: string;
  unitPrice: string;
  quantity: number;
};

type PaytrDirectPaymentCustomer = {
  email: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  paymentAmountKurus: number;
  items: PaytrDirectPaymentItem[];
};

type PaytrDirectFormResponse = {
  ok: boolean;
  merchantOid?: string;
  formAction?: string;
  fields?: Record<string, string>;
  message?: string;
};

type PaytrDirectPaymentPanelProps = {
  customer: PaytrDirectPaymentCustomer;
  disabled: boolean;
  onPaymentStarted: (merchantOid: string) => void;
  onError: (message: string | null) => void;
};

type DirectCardDraft = {
  cardOwner: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
};

const initialCardDraft: DirectCardDraft = {
  cardOwner: "",
  cardNumber: "",
  expiryMonth: "",
  expiryYear: "",
  cvv: ""
};

function normalizeCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 19);
}

function formatCardNumber(value: string) {
  return normalizeCardNumber(value).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function normalizeExpiryYear(value: string) {
  return value.replace(/\D/g, "").slice(-2);
}

function validateCardDraft(card: DirectCardDraft) {
  const cardNumber = normalizeCardNumber(card.cardNumber);
  const expiryMonth = Number(card.expiryMonth);
  const expiryYear = normalizeExpiryYear(card.expiryYear);
  const cvv = card.cvv.replace(/\D/g, "");

  if (card.cardOwner.trim().length < 2 || card.cardOwner.trim().length > 50) {
    return "Kart üzerindeki ad soyad 2-50 karakter arasında olmalıdır.";
  }

  if (cardNumber.length < 12 || cardNumber.length > 19) {
    return "Kart numarası geçerli uzunlukta olmalıdır.";
  }

  if (!Number.isInteger(expiryMonth) || expiryMonth < 1 || expiryMonth > 12) {
    return "Son kullanma ayı 1-12 arasında olmalıdır.";
  }

  if (!/^\d{2}$/.test(expiryYear)) {
    return "Son kullanma yılı iki haneli olmalıdır.";
  }

  if (cvv.length < 3 || cvv.length > 4) {
    return "CVV 3 veya 4 haneli olmalıdır.";
  }

  return null;
}

function appendHiddenInput(form: HTMLFormElement, name: string, value: string) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value;
  form.appendChild(input);
}

function submitDirectPaytrForm({
  card,
  formAction,
  fields
}: {
  card: DirectCardDraft;
  formAction: string;
  fields: Record<string, string>;
}) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = formAction;
  form.acceptCharset = "UTF-8";
  form.style.display = "none";

  Object.entries(fields).forEach(([name, value]) => {
    appendHiddenInput(form, name, value);
  });

  appendHiddenInput(form, "cc_owner", card.cardOwner.trim());
  appendHiddenInput(form, "card_number", normalizeCardNumber(card.cardNumber));
  appendHiddenInput(form, "expiry_month", String(Number(card.expiryMonth)));
  appendHiddenInput(form, "expiry_year", normalizeExpiryYear(card.expiryYear));
  appendHiddenInput(form, "cvv", card.cvv.replace(/\D/g, ""));

  document.body.appendChild(form);
  form.submit();
}

export function PaytrDirectPaymentPanel({
  customer,
  disabled,
  onPaymentStarted,
  onError
}: PaytrDirectPaymentPanelProps) {
  const [card, setCard] = useState<DirectCardDraft>(initialCardDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cardNumberPreview = useMemo(
    () => formatCardNumber(card.cardNumber),
    [card.cardNumber]
  );

  function updateCardField<Key extends keyof DirectCardDraft>(
    key: Key,
    value: DirectCardDraft[Key]
  ) {
    setCard((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleDirectPayment() {
    const validationError = validateCardDraft(card);

    if (validationError) {
      onError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      onError(null);

      const response = await fetch("/api/paytr/direct-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(customer)
      });
      const result = (await response.json()) as PaytrDirectFormResponse;

      if (!response.ok || !result.ok || !result.merchantOid || !result.formAction || !result.fields) {
        throw new Error(result.message || "PayTR Direkt API formu hazırlanamadı.");
      }

      onPaymentStarted(result.merchantOid);
      submitDirectPaytrForm({
        card,
        formAction: result.formAction,
        fields: result.fields
      });
    } catch (error) {
      setIsSubmitting(false);
      onError(
        error instanceof Error
          ? error.message
          : "Direkt API ödemesi başlatılırken beklenmeyen bir hata oluştu."
      );
    }
  }

  return (
    <div className="grid gap-5 rounded-[24px] bg-surface-container-low p-5">
      <div>
        <p className="text-lg font-bold text-on-surface">PayTR Direkt API 3D Secure</p>
        <p className="mt-2 text-sm leading-7 text-on-surface-variant">
          Kart bilgileri ParkChargeEV sunucusuna gönderilmez; form doğrudan PayTR 3D Secure
          sayfasına iletilir.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-on-surface-variant">Kart Üzerindeki Ad Soyad</span>
          <input
            autoComplete="cc-name"
            value={card.cardOwner}
            maxLength={50}
            onChange={(event) => updateCardField("cardOwner", event.target.value)}
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-on-surface-variant">Kart Numarası</span>
          <input
            autoComplete="cc-number"
            inputMode="numeric"
            value={cardNumberPreview}
            onChange={(event) => updateCardField("cardNumber", event.target.value)}
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-on-surface-variant">Son Kullanma Ayı</span>
          <input
            autoComplete="cc-exp-month"
            inputMode="numeric"
            maxLength={2}
            placeholder="12"
            value={card.expiryMonth}
            onChange={(event) =>
              updateCardField("expiryMonth", event.target.value.replace(/\D/g, "").slice(0, 2))
            }
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-on-surface-variant">Son Kullanma Yılı</span>
          <input
            autoComplete="cc-exp-year"
            inputMode="numeric"
            maxLength={4}
            placeholder="28"
            value={card.expiryYear}
            onChange={(event) =>
              updateCardField("expiryYear", event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-on-surface-variant">CVV</span>
          <input
            autoComplete="cc-csc"
            inputMode="numeric"
            maxLength={4}
            value={card.cvv}
            onChange={(event) =>
              updateCardField("cvv", event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className="rounded-2xl border border-outline-variant/45 bg-white px-4 py-4 outline-none transition focus:border-primary"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => void handleDirectPayment()}
        disabled={disabled || isSubmitting}
        className="w-full rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 md:w-fit"
      >
        {isSubmitting ? "PayTR'a yönlendiriliyor..." : "3D Secure ile Öde"}
      </button>
    </div>
  );
}
