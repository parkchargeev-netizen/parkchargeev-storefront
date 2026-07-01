import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
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
import { ProductInfoCards } from "@/components/shop/product-info-cards";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { ProductReviews } from "@/components/shop/product-reviews";
import { JsonLd } from "@/components/seo/json-ld";
import { getProductCommerceBadges } from "@/lib/product-commerce-tags";
import { getDisplayProductImageUrl } from "@/lib/product-media";
import type { ProductModel } from "@/lib/mock-data";
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

function sanitizeProductDescriptionHtml(description: string) {
  return description
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*')/gi, "")
    .replace(/\sstyle=(?:"[^"]*"|'[^']*')/gi, "")
    .replace(/href=(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="/"');
}

function formatProductDescriptionHtml(description: string, summary: string) {
  const normalizedDescription = description.trim();
  const normalizedSummary = summary.trim();
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(normalizedDescription);
  const descriptionHtml = hasHtml
    ? sanitizeProductDescriptionHtml(normalizedDescription)
    : normalizedDescription
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");

  if (!normalizedSummary) {
    return descriptionHtml;
  }

  const plainDescription = normalizedDescription.replace(/<[^>]+>/g, " ");
  const alreadyIncludesSummary = plainDescription
    .toLocaleLowerCase("tr-TR")
    .includes(normalizedSummary.toLocaleLowerCase("tr-TR"));

  return alreadyIncludesSummary
    ? descriptionHtml
    : `${descriptionHtml}<p>${escapeHtml(normalizedSummary)}</p>`;
}

function getProductInfrastructureLabel(product: ProductModel, fallback: string) {
  const corpus = [
    product.name,
    product.category,
    product.summary,
    product.description,
    product.powerLabel,
    product.specs.map((spec) => `${spec.label} ${spec.value}`).join(" ")
  ]
    .join(" ")
    .toLocaleLowerCase("tr-TR");
  const fallbackText = fallback.toLocaleLowerCase("tr-TR");
  const explicitDc = /\bdc\b/.test(product.powerLabel.toLocaleLowerCase("tr-TR")) ||
    /\bccs\b/.test(corpus) ||
    product.category.toLocaleLowerCase("tr-TR").includes("dc");
  const likelyAc = /\bac\b/.test(corpus) || /type\s*2|tip\s*2/.test(corpus);

  if (!explicitDc && likelyAc && fallbackText.includes("dc")) {
    return product.powerLabel.includes("22") ? "Trifaze AC" : "AC altyapı";
  }

  return fallback;
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
  const defaultVariant =
    product.variants?.find((variant) => variant.isDefault) ?? product.variants?.[0];
  const storeProfile = getProductStoreProfile(product);
  const commerceBadges = getProductCommerceBadges(product);
  const mediaItems = detailContent.galleryItems;
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
  const productInfoCards = [
    ["Kategori", product.category],
    ["Kullanım", storeProfile.primaryFit],
    ["Altyapı", getProductInfrastructureLabel(product, storeProfile.phaseHint)],
    ["Güç", product.powerLabel || storeProfile.powerTier],
    ["Soket", defaultVariant?.connectorType || storeProfile.connectorHint],
    ["Kurulum", storeProfile.installationMode]
  ] as const;

  return (
    <main className="product-detail-commerce-page">
      <JsonLd data={[productJsonLd, breadcrumbJsonLd, faqJsonLd]} />

      <div className="product-commerce-shell">
        <nav aria-label="Ürün yolu" className="product-commerce-breadcrumb">
          <Link href="/">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/magaza">Mağaza</Link>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <strong>{product.name}</strong>
        </nav>

        <section className="product-commerce-hero" aria-label="Ürün satın alma alanı">
          <div className="product-commerce-media">
            <ProductGallery
              productName={product.name}
              items={mediaItems}
              imageUrl={productImageUrl}
              mediaItems={product.media}
              featureLabels={detailContent.galleryFeatureLabels}
              deviceCaption={detailContent.galleryDeviceCaption}
            />
          </div>

          <aside className="product-commerce-buybox" aria-label="Ürün bilgisi ve sepet">
            <div className="product-commerce-meta">
              <span>ParkChargeEV seçkisi</span>
              <span>{product.category}</span>
              {product.badge ? <span>{product.badge}</span> : null}
            </div>

            <div className="product-commerce-hero-badges" aria-label="Stok ve kargo bilgileri">
              <span
                className={
                  product.stockLabel === "Stokta Yok"
                    ? "product-commerce-hero-badge product-commerce-hero-badge--danger"
                    : "product-commerce-hero-badge product-commerce-hero-badge--stock"
                }
              >
                {product.stockLabel}
              </span>
              {commerceBadges.map((badge) => (
                <span
                  key={badge.label}
                  className={
                    badge.tone === "success"
                      ? "product-commerce-hero-badge product-commerce-hero-badge--shipping"
                      : "product-commerce-hero-badge product-commerce-hero-badge--fast"
                  }
                >
                  {badge.label}
                </span>
              ))}
            </div>

            <h1>{product.name}</h1>
            <p className="product-commerce-summary">
              {product.summary || storeProfile.primaryFit}
            </p>

            <ProductPurchasePanel
              product={product}
              benefits={detailContent.purchaseBenefits}
            />
          </aside>

          <ProductInfoCards
            items={productInfoCards.map(([label, value]) => ({ label, value }))}
          />
        </section>
      </div>

      <div className="product-commerce-content">
        <ProductHighlightGrid product={product} detailContent={detailContent} />
        <ProductDescriptionBlock
          product={product}
          detailContent={detailContent}
          descriptionHtml={descriptionHtml}
        />
        <ProductTechnicalSpecs groups={technicalGroups} />
        <ProductSmartFeatures features={smartFeatures} />
        <ProductTrustGrid detailContent={detailContent} />
        <ProductPolicies detailContent={detailContent} />
        <ProductFaqs detailContent={detailContent} />
        <ProductRelatedProducts
          detailContent={detailContent}
          relatedProducts={relatedProducts}
        />
        <ProductReviews productName={product.name} productSlug={product.slug} />
      </div>
    </main>
  );
}
