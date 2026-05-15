type PaytrIframePanelProps = {
  iframeToken: string | null;
};

export function PaytrIframePanel({ iframeToken }: PaytrIframePanelProps) {
  return (
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
            Bilgileri tamamlayıp “Ödemeyi Hazırla” butonuna bastığınızda güvenli iframe bu
            alana yerleşir.
          </p>
        </div>
      )}
    </div>
  );
}
