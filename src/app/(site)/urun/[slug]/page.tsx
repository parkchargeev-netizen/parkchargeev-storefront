import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cpu, Radio, Settings, ShieldCheck, Sparkles, Wifi, Zap } from "lucide-react";

import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductCard } from "@/components/shop/product-card";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { JsonLd } from "@/components/seo/json-ld";
import { getDisplayProductImageUrl } from "@/lib/product-media";
import {
  getActiveProductSmartFeatures,
  getActiveProductTechnicalGroups,
  getProductDetailContent
} from "@/lib/product-detail-content";
import { getProductStoreProfile } from "@/lib/shop-merchandising";
import {
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getProductImageUrl,
  getProductJsonLd
} from "@/lib/structured-data";
import {
  getPublicProductBySlug,
  getPublicRelatedProducts,
  listPublicProductSlugs
} from "@/server/admin/repository";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function SmartFeatureIcon({ iconName }: { iconName?: string }) {
  const normalizedIconName = iconName?.toLocaleLowerCase("tr-TR") ?? "";
  const Icon =
    normalizedIconName.includes("wifi") || normalizedIconName.includes("wi-fi")
      ? Wifi
      : normalizedIconName.includes("shield") || normalizedIconName.includes("güven")
        ? ShieldCheck
        : normalizedIconName.includes("zap") || normalizedIconName.includes("power")
          ? Zap
          : normalizedIconName.includes("radio") || normalizedIconName.includes("rfid")
            ? Radio
            : normalizedIconName.includes("cpu") || normalizedIconName.includes("ocpp")
              ? Cpu
              : normalizedIconName.includes("setting")
                ? Settings
                : Sparkles;

  return <Icon className="h-5 w-5" aria-hidden />;
}

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
  const smartFeatures = getActiveProductSmartFeatures(product);
  const technicalGroups = getActiveProductTechnicalGroups(product);
  const storeProfile = getProductStoreProfile(product);
  const mediaItems = detailContent.galleryItems;
  const productImageUrl = getDisplayProductImageUrl(product.imageUrl);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Mağaza", path: "/magaza" },
    { name: product.name, path: `/urun/${product.slug}` }
  ]);
  const faqJsonLd = getFaqJsonLd(detailContent.faqs);
  const renderSpecsCard = () => technicalGroups.length ? (
    <div className="product-detail-spec-card surface-card p-8">
      <h2 className="text-3xl font-bold tracking-normal text-on-surface">
        {detailContent.specsHeading}
      </h2>
      <div className="mt-6 space-y-4">
        {technicalGroups.map((group, groupIndex) => (
          <article
            key={`${group.title}-${groupIndex}`}
            className="rounded-lg border border-outline-variant/35 bg-white/80 px-5 py-4"
          >
            <h3 className="text-base font-bold text-on-surface">
              {group.title}
            </h3>
            {group.description ? (
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {group.description}
              </p>
            ) : null}
            <div className="mt-3 divide-y divide-outline-variant/25">
              {group.items.map((spec) => (
                <div
                  key={`${group.title}-${spec.name}-${spec.value}`}
                  className="grid gap-2 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] sm:items-start"
                >
                  <span className="text-sm font-semibold text-on-surface-variant">{spec.name}</span>
                  <span className="text-sm font-bold leading-6 text-on-surface sm:text-right">
                    {[spec.value, spec.unit].filter(Boolean).join(" ")}
                    {spec.description ? (
                      <small className="mt-1 block text-xs font-medium leading-5 text-on-surface-variant">
                        {spec.description}
                      </small>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  ) : null;
  const renderDescriptionCard = () => (
    <div className="product-detail-description-card surface-card p-8">
      <p className="text-sm font-semibold uppercase tracking-normal text-primary">
        Ürün açıklaması
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-normal text-on-surface">
        {product.name} hakkında
      </h2>
      <div className="mt-5 space-y-4 text-base leading-8 text-on-surface-variant">
        <p>{product.description}</p>
        <p>{product.summary}</p>
      </div>
    </div>
  );
  return (
    <div className="product-detail-page mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <JsonLd data={[productJsonLd, breadcrumbJsonLd, faqJsonLd]} />

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
            {renderDescriptionCard()}
            {renderSpecsCard()}
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

          <h1 className="mt-6 text-3xl font-bold tracking-normal text-on-surface md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 line-clamp-2 text-base leading-7 text-on-surface-variant">
            {storeProfile.primaryFit}
          </p>

          <div className="product-detail-feature-strip mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Güç", storeProfile.powerTier],
              ["Kurulum", storeProfile.installationMode],
              ["Uyum", storeProfile.connectorHint]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-surface-container-low px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-normal text-on-surface-variant">
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

          <div className="product-detail-readiness-strip mt-5">
            {detailContent.purchaseReadiness.slice(0, 3).map((item) => (
              <div
                key={item.label}
                className="product-detail-readiness-chip"
              >
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <details className="product-detail-checklist mt-4">
            <summary>Uygunluk notları</summary>
            <div>
              {detailContent.decisionChecks.slice(0, 3).map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </details>

          <div className="mt-6 overflow-hidden rounded-lg border border-outline-variant/40 bg-white">
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

      {smartFeatures.length > 0 ? (
        <section className="product-detail-smart-features mt-8">
          <div className="surface-card p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-normal text-primary">
                  Akıllı özellikler
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-normal text-on-surface">
                  Ürünü günlük kullanıma hazır hale getiren yetenekler.
                </h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {smartFeatures.map((feature) => (
                <article
                  key={`${feature.title}-${feature.description}`}
                  className="rounded-lg border border-outline-variant/35 bg-white/85 p-5 shadow-[0_16px_42px_rgba(6,51,38,0.08)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-[0_12px_28px_rgba(6,51,38,0.18)]">
                    <SmartFeatureIcon iconName={feature.iconName} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-on-surface">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="product-detail-info-grid mt-8 grid gap-6 lg:hidden">
        {renderDescriptionCard()}
        {renderSpecsCard()}
      </section>

      <section className="mt-8 surface-card p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">
              Uygunluk kontrolü
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-on-surface">
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
              className="rounded-lg border border-outline-variant/35 bg-surface-container-low p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-normal text-on-surface-variant">
                {label}
              </p>
              <p className="mt-3 text-xl font-bold text-on-surface">{value}</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="product-detail-related mt-12">
        <div className="surface-card p-8">
          <h2 className="text-3xl font-bold tracking-normal text-on-surface">
            {detailContent.faqHeading}
          </h2>
          <div className="mt-6 grid gap-4">
            {detailContent.faqs.map((faq) => (
              <article key={faq.question} className="rounded-lg bg-surface-container-low p-5">
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
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">
              {detailContent.relatedEyebrow}
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-normal text-on-surface">
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
