import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/ui/page-header";
import { evGlossaryTerms } from "@/features/seo/domain/ev-charging-content";
import {
  getBreadcrumbJsonLd,
  getDefinedTermSetJsonLd
} from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Elektrikli Araç Şarj Sözlüğü",
  description:
    "AC, DC, Type 2, CCS2, wallbox, kW, kWh, OCPP, RFID ve dinamik yük yönetimi gibi elektrikli araç şarj terimlerini sade açıklamalarla öğrenin.",
  alternates: {
    canonical: "/elektrikli-arac-sarj-sozlugu"
  }
};

export default function EvChargingGlossaryPage() {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Elektrikli Araç Şarj Rehberi", path: "/elektrikli-arac-sarj-rehberi" },
    { name: "Elektrikli Araç Şarj Sözlüğü", path: "/elektrikli-arac-sarj-sozlugu" }
  ]);
  const termSetJsonLd = getDefinedTermSetJsonLd(
    "Elektrikli Araç Şarj Sözlüğü",
    "/elektrikli-arac-sarj-sozlugu",
    evGlossaryTerms
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8" data-motion-scope>
      <JsonLd data={[termSetJsonLd, breadcrumbJsonLd]} />
      <PageHeader
        align="center"
        eyebrow="Teknik sözlük"
        title="Elektrikli araç şarj terimlerini sade ve doğru biçimde öğrenin"
        body="Şarj cihazı seçerken karşılaşacağınız bağlantı, güç, enerji ve yazılım kavramlarını tek sayfada açıklayan ParkChargeEV EV şarj sözlüğü."
      />

      <section className="mt-12 divide-y divide-outline-variant/40 border-y border-outline-variant/40">
        {evGlossaryTerms.map((term) => (
          <article
            key={term.name}
            className="grid gap-4 py-7 md:grid-cols-[0.32fr_1fr_auto] md:items-start"
          >
            <h2 className="text-xl font-bold text-on-surface">{term.name}</h2>
            <p className="text-sm leading-7 text-on-surface-variant">{term.description}</p>
            <Link
              href={term.relatedHref}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary"
            >
              İlgili rehber
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </article>
        ))}
      </section>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 bg-surface-container-low p-6">
        <p className="max-w-2xl text-sm leading-7 text-on-surface-variant">
          Terimleri öğrendikten sonra araç, güç ve kurulum koşullarınıza uygun
          cihaz sınıfını ürün seçiciyle daraltabilirsiniz.
        </p>
        <Link href="/urun-secici" className="premium-btn premium-btn--primary">
          Ürün seçiciye git
        </Link>
      </div>
    </main>
  );
}
