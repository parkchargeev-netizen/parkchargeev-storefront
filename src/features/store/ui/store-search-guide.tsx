import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import {
  storeDecisionGuides,
  storeSearchFaqs
} from "@/features/store/domain/store-search-content";

export function StoreSearchGuide() {
  return (
    <section
      className="store-search-guide mt-14 border-t border-outline-variant/35 pt-10"
      aria-labelledby="store-search-guide-title"
    >
      <div className="max-w-4xl">
        <p className="premium-eyebrow">Satın alma rehberi</p>
        <h2
          id="store-search-guide-title"
          className="mt-3 text-3xl font-bold text-on-surface md:text-4xl"
        >
          Elektrikli araç şarj cihazı nasıl seçilir?
        </h2>
        <p className="mt-4 text-base leading-8 text-on-surface-variant">
          Elektrikli araç şarj aleti, EV charger veya wallbox olarak aranan
          ürünlerde doğru seçim yalnızca fiyata bağlı değildir. Aracın kabul
          ettiği AC güç, evin veya iş yerinin elektrik altyapısı, bağlantı tipi
          ve kurulum mesafesi birlikte değerlendirilmelidir.
        </p>
        <Link
          href="/elektrikli-arac-sarj-rehberi"
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary"
        >
          Tüm EV şarj rehberlerini aç
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {storeDecisionGuides.map((guide) => (
          <article key={guide.title} className="border-t-2 border-primary pt-5">
            <h3 className="text-xl font-bold text-on-surface">{guide.title}</h3>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              {guide.body}
            </p>
            <Link
              href={guide.href}
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary"
            >
              {guide.cta}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-on-surface md:text-3xl">
          Elektrikli araç şarj cihazları hakkında sık sorulanlar
        </h2>
        <div className="mt-5 divide-y divide-outline-variant/35 border-y border-outline-variant/35">
          {storeSearchFaqs.map((faq) => (
            <details key={faq.question} className="group py-1">
              <summary className="cursor-pointer list-none py-5 text-base font-bold text-on-surface">
                {faq.question}
              </summary>
              <p className="max-w-4xl pb-5 text-sm leading-7 text-on-surface-variant">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
