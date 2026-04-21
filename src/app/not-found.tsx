import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
        404
      </p>
      <h1 className="mt-4 text-5xl font-black tracking-[-0.08em] text-on-surface">
        Sayfa bulunamadı
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-on-surface-variant">
        Aradığınız sayfa kaldırılmış, taşınmış veya henüz yeni mimaride
        oluşturulmamış olabilir.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-white"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}

