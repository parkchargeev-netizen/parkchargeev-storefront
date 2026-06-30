import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ProductCommerceBadges,
  ProductDescriptionBlock,
  ProductFaqs,
  ProductHighlightGrid,
  ProductPolicies,
  ProductRelatedProducts,
  ProductSmartFeatures,
  ProductTechnicalSpecs,
  ProductTrustGrid
} from "@/components/shop/product-detail-sections";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { ProductReviews } from "@/components/shop/product-reviews";
import { JsonLd } from "@/components/seo/json-ld";
import { getProductCommerceBadges } from "@/lib/product-commerce-tags";
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatProductDescriptionHtml(description: string, summary: string) {
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(description);
  const descriptionHtml = hasHtml
    ? description
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/\son\w+=(?:"[^"]*"|'[^']*')/gi, "")
        .replace(/\sstyle=(?:"[^"]*"|'[^']*')/gi, "")
        .replace(/href=(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="/"')
    : `<p>${escapeHtml(description)}</p>`;

  return `${descriptionHtml}<p>${escapeHtml(summary)}</p>`;
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

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [relatedProducts] = await Promise.all([
    getPublicRelatedProducts(product)
  ]);
  const productJsonLd = getProductJsonLd(product);
  const detailContent = getProductDetailContent(product);
  const smartFeatures = getActiveProductSmartFeatures(product);
  const technicalGroups = getActiveProductTechnicalGroups(product);
  const commerceBadges = getProductCommerceBadges(product);
  const defaultVariant =
    product.variants?.find((variant) => variant.isDefault) ?? product.variants?.[0];
  const productSku = defaultVariant?.sku ?? product.slug.toUpperCase();
  const storeProfile = getProductStoreProfile(product);
  const productImageUrl = getDisplayProductImageUrl(product.imageUrl);
  const descriptionHtml = formatProductDescriptionHtml(
    product.descriptionHtml ?? product.description,
    product.summary
  );
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Ana Sayfa", path: "/" },
    { name: "Mağaza", path: "/magaza" },
    { name: product.name, path: `/urun/${product.slug}` }
  ]);
  const faqJsonLd = getFaqJsonLd(detailContent.faqs);

  return (
    <main className="product-detail-page mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd data={[productJsonLd, breadcrumbJsonLd, faqJsonLd]} />

      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant" aria-label="Ürün yolu">
        <Link href="/" className="transition hover:text-primary">
          Ana Sayfa
        </Link>
        <span>/</span>
        <Link href="/magaza" className="transition hover:text-primary">
          Mağaza
        </Link>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="text-on-surface">{product.name}</span>
      </nav>

      <section className="product-detail-hero-v2">
        <div className="product-detail-gallery-column">
          <ProductGallery
            productName={product.name}
            items={detailContent.galleryItems}
            imageUrl={productImageUrl}
            mediaItems={product.media}
            featureLabels={detailContent.galleryFeatureLabels}
            deviceCaption={detailContent.galleryDeviceCaption}
          />
        </div>

        <aside className="product-detail-buybox-v2 surface-card">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-normal text-on-surface-variant">
            <span>Marka: ParkChargeEV seçkisi</span>
            <span className="text-on-surface-variant/50">|</span>
            <span>Ürün kodu: {productSku}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700">
              ★★★★★
            </span>
            <span className="text-sm font-semibold text-on-surface-variant">
              Teknik kontrol, güvenli ödeme ve kurulum desteği
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {product.badge ? (
              <span className="product-detail-commerce-pill product-detail-commerce-pill--primary">
                {product.badge}
              </span>
            ) : null}
            <ProductCommerceBadges badges={commerceBadges} stockLabel={product.stockLabel} />
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-normal text-on-surface md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-on-surface-variant">
            {storeProfile.primaryFit}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Güç", storeProfile.powerTier],
              ["Uyum", storeProfile.connectorHint],
              ["Kurulum", storeProfile.installationMode]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-surface-container-low px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-normal text-on-surface-variant">
                  {label}
                </p>
                <p className="mt-1 text-sm font-bold leading-5 text-on-surface">{value}</p>
              </div>
            ))}
          </div>

          <ProductPurchasePanel product={product} benefits={detailContent.purchaseBenefits} />

          <div className="product-detail-readiness-strip mt-5">
            {detailContent.purchaseReadiness.slice(0, 3).map((item) => (
              <div key={item.label} className="product-detail-readiness-chip">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <ProductHighlightGrid product={product} detailContent={detailContent} />
      <ProductTrustGrid detailContent={detailContent} />
      <ProductSmartFeatures features={smartFeatures} />
      <ProductTechnicalSpecs groups={technicalGroups} />
      <ProductDescriptionBlock
        product={product}
        detailContent={detailContent}
        descriptionHtml={descriptionHtml}
      />
      <ProductPolicies detailContent={detailContent} />
      <ProductReviews productName={product.name} productSlug={product.slug} />
      <ProductFaqs detailContent={detailContent} />
      <ProductRelatedProducts detailContent={detailContent} relatedProducts={relatedProducts} />
    </main>
  );
}
