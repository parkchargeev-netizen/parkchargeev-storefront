import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductCard } from "@/components/shop/product-card";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { getDisplayProductImageUrl } from "@/lib/product-media";
import { getProductDetailContent } from "@/lib/product-detail-content";
import { getProductStoreProfile } from "@/lib/shop-merchandising";
import {
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getProductImageUrl,
  getProductJsonLd,
  stringifyJsonLd
} from "@/lib/structured-data";
import {
  getPublicProductBySlug,
  getPublicRelatedProducts,
  listPublicProductSlugs
} from "@/server/admin/repository";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const productSlugs = await listPublicProductSlugs();
  return productSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

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
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getPublicRelatedProducts(product);
  const productJsonLd = getProductJsonLd(product);
  const detailContent = getProductDetailContent(product);
  const storeProfile = getProductStoreProfile(product);
  const mediaItems = detailContent.galleryItems;
  const productImageUrl = getDisplayProductImageUrl(product.imageUrl);
  const isAccessoryProduct = storeProfile.powerTier === "Aksesuar";
  const decisionNote = isAccessoryProduct
    ? "Aksesuar ürünlerinde karar için soket tipi, kablo uzunluğu ve araç uyumu yeterlidir. Emin değilseniz ürün sayfasından keşif yerine hızlı destek alabilirsiniz."
    : "Yanlış cihaz veya eksik kurulum kapsamı riskini azaltmak için pano kapasitesi, faz yapısı, kablo hattı ve koruma ekipmanı keşifte kontrol edilir.";
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Mağaza", path: "/magaza" },
    { name: product.name, path: `/urun/${product.slug}` }
  ]);
  const faqJsonLd = getFaqJsonLd(detailContent.faqs);
  const renderSpecsCard = () => (
    <div className="product-detail-spec-card surface-card p-8">
      <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
        {detailContent.specsHeading}
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
  );
  const renderIntentCard = () => (
    <div className="product-detail-intent-card overflow-hidden rounded-[28px] bg-linear-to-br from-primary to-primary-container p-8 text-white shadow-[0_24px_80px_rgba(6,51,38,0.26)]">
      <h2 className="text-3xl font-bold tracking-[-0.05em]">
        {detailContent.intentHeading}
      </h2>
      <p className="mt-4 text-base leading-7 text-white/80">
        {detailContent.intentBody}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {detailContent.seoIntents.map((intent) => (
          <span
            key={intent}
            className="rounded-full bg-white/[0.16] px-4 py-3 text-sm font-semibold text-white"
          >
            {intent}
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <div className="product-detail-page mx-auto max-w-7xl px-6 py-10 lg:px-8">
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

      <div className="product-detail-hero grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="product-detail-gallery-column">
          <ProductGallery
            productName={product.name}
            items={mediaItems}
            imageUrl={productImageUrl}
            mediaItems={product.media}
            featureLabels={detailContent.galleryFeatureLabels}
            deviceCaption={detailContent.galleryDeviceCaption}
          />
          <div className="product-detail-desktop-under-gallery mt-5 hidden gap-4 lg:grid">
            <div className="grid gap-4">
              {renderSpecsCard()}
              {renderIntentCard()}
            </div>
            <div className="surface-card p-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                    Satış öncesi netlik
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-on-surface">
                    Uygunluk, teslimat ve destek bilgileri aynı ekranda.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                    {decisionNote}
                  </p>
                </div>
                <Link
                  href={detailContent.support.href}
                  className="rounded-2xl bg-surface-container-high px-5 py-4 text-center text-sm font-semibold text-primary"
                >
                  {detailContent.support.ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <aside className="product-detail-buybox surface-card h-fit p-8">
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

          <div className="product-detail-feature-strip mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Güç", storeProfile.powerTier],
              ["Kurulum", storeProfile.installationMode],
              ["Uyum", storeProfile.connectorHint]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-surface-container-low px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  {label}
                </p>
                <p className="mt-1 text-sm font-bold leading-5 text-on-surface">{value}</p>
              </div>
            ))}
          </div>

          <ProductPurchasePanel
            product={product}
            benefits={detailContent.purchaseBenefits}
          />

          <div className="mt-6 grid gap-3">
            {detailContent.purchaseReadiness.map((item) => (
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
            {detailContent.decisionChecks.map((item) => (
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
              {detailContent.support.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">
              {detailContent.support.body}
            </p>
            <Link
              href={detailContent.support.href}
              className="mt-6 inline-block rounded-2xl bg-surface-container-high px-5 py-4 text-sm font-semibold text-primary"
            >
              {detailContent.support.ctaLabel}
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-outline-variant/40 bg-white">
            {detailContent.policyDetails.map((detail, index) => (
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

      <section className="product-detail-info-grid mt-8 grid gap-6 lg:hidden">
        {renderSpecsCard()}
        {renderIntentCard()}
      </section>

      <section className="mt-8 surface-card p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Uygunluk kontrolü
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-on-surface">
              Bu ürün sizin senaryonuza uyuyor mu?
            </h2>
          </div>
          <Link href="/urun-secici" className="text-sm font-semibold text-primary">
            Akıllı seçiciye git
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Güç sınıfı", storeProfile.powerTier, storeProfile.chargeSpeedHint],
            ["Elektrik altyapısı", storeProfile.phaseHint, storeProfile.installationHint],
            ["Araç uyumu", storeProfile.connectorHint, storeProfile.primaryFit]
          ].map(([label, value, detail]) => (
            <div
              key={label}
              className="rounded-[22px] border border-outline-variant/35 bg-surface-container-low p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                {label}
              </p>
              <p className="mt-3 text-xl font-bold text-on-surface">{value}</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {detail}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-[22px] border border-primary/15 bg-primary/5 p-5">
          <p className="text-sm font-semibold text-primary">Karar notu</p>
          <p className="mt-2 text-sm leading-7 text-on-surface-variant">
            {decisionNote}
          </p>
        </div>
      </section>

      <section className="product-detail-related mt-12">
        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-on-surface">
            {detailContent.faqHeading}
          </h2>
          <div className="mt-6 grid gap-4">
            {detailContent.faqs.map((faq) => (
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
              {detailContent.relatedEyebrow}
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] text-on-surface">
              {detailContent.relatedHeading}
            </h2>
          </div>
        </div>

        <div
          className="product-detail-related-track mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          aria-label="İlgili ürünler kaydırmalı liste"
        >
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </section>
    </div>
  );
}
