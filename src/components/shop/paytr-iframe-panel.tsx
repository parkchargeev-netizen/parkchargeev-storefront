"use client";

import { CreditCard, LockKeyhole } from "lucide-react";
import { useEffect, useRef } from "react";

type PaytrIframePanelProps = {
  iframeToken: string | null;
};

const PAYTR_IFRAME_RESIZER_SRC = "https://www.paytr.com/js/iframeResizer.min.js?v2";

export function PaytrIframePanel({ iframeToken }: PaytrIframePanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeToken || !iframeRef.current) {
      return;
    }

    const paytrWindow = window as Window & {
      iFrameResize?: (
        options: Record<string, unknown>,
        target: HTMLIFrameElement | string
      ) => void;
    };
    const initializeResizer = () => {
      if (paytrWindow.iFrameResize && iframeRef.current) {
        paytrWindow.iFrameResize(
          {
            checkOrigin: false,
            heightCalculationMethod: "lowestElement",
            scrolling: true
          },
          iframeRef.current
        );
      }
    };
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-paytr-iframe-resizer="true"]'
    );

    if (existingScript) {
      if (existingScript.src !== PAYTR_IFRAME_RESIZER_SRC) {
        existingScript.remove();
      } else {
        if (paytrWindow.iFrameResize) {
          initializeResizer();
        } else {
          existingScript.addEventListener("load", initializeResizer, { once: true });
        }

        return () => {
          existingScript.removeEventListener("load", initializeResizer);
        };
      }
    }

    const script = document.createElement("script");
    script.src = PAYTR_IFRAME_RESIZER_SRC;
    script.async = true;
    script.dataset.paytrIframeResizer = "true";
    script.addEventListener("load", initializeResizer, { once: true });
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", initializeResizer);
    };
  }, [iframeToken]);

  return (
    <section
      id="paytr-payment-frame"
      className="scroll-mt-28 rounded-lg border border-white/80 bg-white/88 p-4 shadow-[0_24px_80px_rgba(6,51,38,0.10)] backdrop-blur-xl sm:p-6 lg:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-primary">
            Güvenli ödeme alanı
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-on-surface">
            Kart bilgileri sadece güvenli iframe içinde girilir.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
            Ödeme oturumu hazırlandığında form bu bölümde açılır. ParkChargeEV kart numarası,
            son kullanma tarihi veya CVV istemez.
          </p>
        </div>
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      {iframeToken ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-outline-variant/35 bg-white shadow-inner">
          <iframe
            ref={iframeRef}
            src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
            id="paytriframe"
            frameBorder="0"
            scrolling="no"
            title="Güvenli kart ödeme formu"
            allow="payment *; fullscreen *; publickey-credentials-get *"
            referrerPolicy="strict-origin-when-cross-origin"
            className="min-h-[680px] w-full"
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-primary/35 bg-linear-to-br from-primary/8 via-white to-secondary/8 p-6 text-center sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-white text-primary shadow-[0_14px_30px_rgba(6,51,38,0.12)]">
            <CreditCard className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-lg font-bold text-on-surface">Ödeme formu beklemede</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
            İletişim ve adres bilgilerini tamamlayıp onay verdiğinizde güvenli ödeme oturumu bu
            alanda otomatik olarak başlatılır.
          </p>
        </div>
      )}
    </section>
  );
}
