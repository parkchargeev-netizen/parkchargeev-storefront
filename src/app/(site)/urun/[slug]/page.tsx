import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductCard } from "@/components/shop/product-card";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { formatPriceTRY } from "@/lib/format";
import {
  getProductBySlug,
  getRelatedProducts,
  products
} from "@/lib/mock-data";
import {
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getProductImageUrl,
  getProductJsonLd,
  stringifyJsonLd
} from "@/lib/structured-data";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Ürün bulunamadı"
    };
  }

  return {
    title: product.name,
    description: product.summary,
    alternates: {
      canonical: `/urun/${product.slug}`
    },
    openGraph: {
      title: product.name,
      description: product.summary,
      type: "website",
      images: [
        {
          url: getProductImageUrl(product),
          width: 1200,
          height: 630,
          alt: product.name
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.summary,
      images: [getProductImageUrl(product)]
    }
  };
}

export default async function ProductDetailPage({
  params
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product);
  const productJsonLd = getProductJsonLd(product);
  const mediaItems = ["Ön görünüm", "Yan profil", "Montaj görünümü", "Video"];
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Mağaza", path: "/magaza" },
    { name: product.name, path: `/urun/${product.slug}` }
  ]);
  const faqJsonLd = getFaqJsonLd(product.faqs);
  const discountPercent = product.compareAtKurus
    ? Math.round(((product.compareAtKurus - product.priceKurus) / product.compareAtKurus) * 100)
    : null;
  const decisionChecks = [
    "Kargo, KDV ve kurulum kapsamı karar öncesinde ayrı ayrı gösterilir.",
    "Keşif talebiyle pano kapasitesi ve kablo hattı netleştirilebilir.",
    "PayTR iFrame akışı kart verisini site sunucusuna taşımaz."
  ];
  const purchaseReadiness = [
    {
      label: "Kurulum dahil mi?",
      value:
        product.category === "Aksesuar"
          ? "Kurulum gerektirmez"
          : "Keşif sonrası kurulum teklifi eklenebilir"
    },
    {
      label: "Keşif gerekiyor mu?",
      value:
        product.powerLabel.toLocaleLowerCase("tr-TR").includes("dc") ||
        product.powerLabel.includes("22")
          ? "Önerilir"
          : "Altyapı bilinmiyorsa önerilir"
    },
    {
      label: "Uyumlu araçlar",
      value:
        product.category === "Aksesuar"
          ? "Type 2 AC soketli araçlar"
          : "Type 2 AC veya CCS2 desteğine göre seçilir"
    }
  ];
  const policyDetails = [
    {
      title: "Teslimat ve kurulum",
      body:
        "Stoktaki ürünlerde standart sevkiyat 2-5 iş günü olarak planlanır. Kurulum talebi varsa saha keşfi sonrası randevu ve kapsam ayrıca netleştirilir."
    },
    {
      title: "İade ve değişim",
      body:
        "Kullanılmamış ürünlerde 14 gün içinde iade talebi alınabilir. Saha montajı yapılan projelerde keşif ve kurulum kapsamı ayrı değerlendirilir."
    },
    {
      title: "Garanti ve servis",
      body:
        "Ürünler için 2 yıl garanti ve kurulum sonrası teknik destek süreci sunulur. Kurumsal projelerde bakım periyodu teklif kapsamına eklenebilir."
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(faqJsonLd) }}
      />

      <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/" className="transition hover:text-primary">
          Ana Sayfa
        </Link>
        <span>›</span>
        <Link href="/magaza" className="transition hover:text-primary">
          Mağaza
        </Link>
        <span>›</span>
        <span>{product.category}</span>
        <span>›</span>
        <span className="text-on-surface">{product.name}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <ProductGallery productName={product.name} items={mediaItems} />

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="surface-card p-8">
              <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
                Teknik özellikler
              </h2>
              <div className="mt-6 space-y-4">
                {product.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between gap-6 border-b border-outline-variant/30 pb-4"
                  >
                    <span className="text-sm text-on-surface-variant">{spec.label}</span>
                    <span className="text-right font-semibold text-on-surface">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] bg-linear-to-br from-primary to-primary-container p-8 text-white shadow-[0_24px_80px_rgba(0,68,211,0.26)]">
              <h2 className="text-3xl font-bold tracking-[-0.05em]">
                Satın alma niyetleri
              </h2>
              <p className="mt-4 text-base leading-7 text-white/80">
                Bu ürün kullanıcıların en çok aşağıdaki karar sorularında öne çıkar.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {product.seoIntent.map((intent) => (
                  <span
                    key={intent}
                    className="rounded-full bg-white/12 px-4 py-3 text-sm font-semibold text-white"
                  >
                    {intent}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="surface-card p-8">
              <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
                Kullanım senaryoları
              </h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {product.useCases.map((useCase) => (
                  <span
                    key={useCase}
                    className="rounded-full bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            </div>

            <div className="surface-card p-8">
              <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
                Öne çıkan avantajlar
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-on-surface-variant">
                {product.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <aside className="surface-card h-fit p-8">
          <div className="flex items-center gap-3">
            {product.badge ? (
              <span className="rounded-full bg-secondary-container px-3 py-2 text-sm font-semibold text-secondary">
                {product.badge}
              </span>
            ) : null}
            <span className="rounded-full bg-surface-container-low px-3 py-2 text-sm font-semibold text-primary">
              {product.stockLabel}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-[-0.07em] text-on-surface">
            {product.name}
          </h1>
          <p className="mt-4 text-lg leading-8 text-on-surface-variant">
            {product.description}
          </p>

          <div className="mt-8 flex items-end gap-4">
            <p className="text-5xl font-black tracking-[-0.08em] text-primary">
              {formatPriceTRY(product.priceKurus)}
            </p>
            {product.compareAtKurus ? (
              <div className="pb-1">
                <p className="text-lg font-semibold text-on-surface-variant line-through">
                  {formatPriceTRY(product.compareAtKurus)}
                </p>
                {discountPercent ? (
                  <p className="mt-1 text-sm font-semibold text-secondary">
                    %{discountPercent} avantaj
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <ProductPurchasePanel product={product} />

          <div className="mt-6 grid gap-3">
            {purchaseReadiness.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-on-surface">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3">
            {decisionChecks.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-outline-variant/35 bg-white px-4 py-3 text-sm leading-6 text-on-surface-variant"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] border border-outline-variant/40 bg-white p-6">
            <h2 className="text-2xl font-bold tracking-[-0.05em] text-on-surface">
              Satın alma öncesi destek
            </h2>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">
              Ürünün saha uygunluğunu netleştirmek için teknik keşif ve kurulum danışmanlığı
              talebinizi iletebilirsiniz.
            </p>
            <Link
              href="/iletisim"
              className="mt-6 inline-block rounded-2xl bg-surface-container-high px-5 py-4 text-sm font-semibold text-primary"
            >
              Teknik Değerlendirme İste
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-outline-variant/40 bg-white">
            {policyDetails.map((detail, index) => (
              <details
                key={detail.title}
                className={index > 0 ? "border-t border-outline-variant/30" : undefined}
                open={index === 0}
              >
                <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-on-surface">
                  {detail.title}
                </summary>
                <p className="px-5 pb-5 text-sm leading-7 text-on-surface-variant">
                  {detail.body}
                </p>
              </details>
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-12">
        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            Sık sorulan sorular
          </h2>
          <div className="mt-6 grid gap-4">
            {product.faqs.map((faq) => (
              <article key={faq.question} className="rounded-[24px] bg-surface-container-low p-5">
                <h3 className="text-lg font-semibold text-on-surface">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary">
              İlgili ürünler
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] text-on-surface">
              Karşılaştırılabilecek alternatifler
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </section>
    </div>
  );
}
