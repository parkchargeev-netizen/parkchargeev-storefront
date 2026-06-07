type ProductDevicePreviewProps = {
  productName: string;
  powerLabel: string;
  className?: string;
};

export function ProductDevicePreview({
  productName,
  powerLabel,
  className = ""
}: ProductDevicePreviewProps) {
  return (
    <div
      className={`relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-primary to-secondary ${className}`}
      role="img"
      aria-label={`${productName} temsili ürün görseli`}
    >
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="absolute left-5 right-5 top-1/2 h-1 -translate-y-1/2 rounded-full bg-linear-to-r from-transparent via-secondary-container to-transparent shadow-[0_0_26px_rgba(107,255,143,0.58)]" />
      <div className="relative z-10 h-[68%] w-[38%] min-w-28 rounded-[2rem] border border-white/24 bg-white p-4 shadow-[0_26px_70px_rgba(0,0,0,0.34)]">
        <div className="mx-auto flex aspect-square w-[58%] items-center justify-center rounded-full border-[10px] border-primary bg-primary/10">
          <span className="h-4 w-4 rounded-full bg-secondary" />
        </div>
        <div className="mt-5 space-y-2">
          <span className="block h-2.5 rounded-full bg-slate-200" />
          <span className="block h-2.5 w-2/3 rounded-full bg-slate-200" />
        </div>
        <span className="absolute bottom-3 right-3 h-3 w-3 rounded-full bg-secondary-container shadow-[0_0_18px_rgba(107,255,143,0.75)]" />
      </div>
      <span className="absolute bottom-4 left-4 rounded-full bg-white/14 px-3 py-1 text-xs font-black text-white backdrop-blur">
        {powerLabel}
      </span>
    </div>
  );
}
