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
import { getDisplayProductImageUrl } from "@/lib/product-media";
import {
  getActiveProductSmartFeatures,
  getActiveProductTechnicalGroups,
  getActiveProductDetailBadges,
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
  const productBadges = getActiveProductDetailBadges(product);
  const heroBadges = productBadges.filter((badge) => badge.position === "hero");
  const imageBadges = productBadges.filter((badge) =>
    badge.position === "image-left" || badge.position === "image-right"
  );
  const smartFeatures = getActiveProductSmartFeatures(product);
  const technicalGroups = getActiveProductTechnicalGroups(product);
  const storeProfile = getProductStoreProfile(product);
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
              commerceBadges={imageBadges}
            />
          </div>

          <aside className="product-commerce-buybox" aria-label="Ürün bilgisi ve sepet">
            <div className="product-commerce-meta">
              {[detailContent.heroEyebrow, ...heroBadges.map((badge) => badge.label)]
                .filter(Boolean)
                .map((label) => (
                  <span key={label}>{label}</span>
                ))}
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
            </div>

            <h1>{product.name}</h1>
            <p className="product-commerce-summary">
              {product.summary || storeProfile.primaryFit}
            </p>

            <ProductPurchasePanel
              product={product}
              labels={detailContent.actionLabels}
            />
          </aside>

          <ProductInfoCards
            items={detailContent.infoCards.map((item) => ({
              label: item.label,
              value: item.value
            }))}
          />
        </section>
      </div>

      <div className="product-commerce-content">
        <ProductHighlightGrid detailContent={detailContent} />
        <ProductDescriptionBlock
          product={product}
          detailContent={detailContent}
          descriptionHtml={descriptionHtml}
        />
        <ProductTechnicalSpecs detailContent={detailContent} groups={technicalGroups} />
        <ProductSmartFeatures detailContent={detailContent} features={smartFeatures} />
        <ProductTrustGrid detailContent={detailContent} />
        <ProductPolicies detailContent={detailContent} />
        <ProductFaqs detailContent={detailContent} />
        <ProductRelatedProducts
          detailContent={detailContent}
          relatedProducts={relatedProducts}
        />
        {detailContent.reviews.isEnabled ? (
          <ProductReviews
            content={detailContent.reviews}
            productName={product.name}
            productSlug={product.slug}
          />
        ) : null}
      </div>
    </main>
  );
}
