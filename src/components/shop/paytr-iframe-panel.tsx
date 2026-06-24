import { CreditCard, LockKeyhole } from "lucide-react";

type PaytrIframePanelProps = {
  iframeToken: string | null;
};

export function PaytrIframePanel({ iframeToken }: PaytrIframePanelProps) {
  return (
    <section className="rounded-lg border border-white/80 bg-white/88 p-4 shadow-[0_24px_80px_rgba(6,51,38,0.10)] backdrop-blur-xl sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-primary">
            PayTR güvenli ödeme ekranı
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-on-surface">
            Kart bilgileri sadece PayTR alanında girilir.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
            Ödeme oturumu başarıyla hazırlandığında PayTR iframe bu bölümde açılır. Bu alan dışındaki
            hiçbir ParkChargeEV formu kart numarası, son kullanma tarihi veya CVV istemez.
          </p>
        </div>
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      {iframeToken ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-outline-variant/35 bg-white shadow-inner">
          <iframe
            src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
            id="paytriframe"
            frameBorder="0"
            scrolling="no"
            title="PayTR ödeme formu"
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
            İletişim ve adres bilgilerini tamamlayıp onay verdiğinizde PayTR güvenli ödeme oturumu
            bu alanda açılır.
          </p>
        </div>
      )}
    </section>
  );
}
