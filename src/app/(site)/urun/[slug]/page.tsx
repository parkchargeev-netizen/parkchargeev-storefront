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
import { ProductReviewsLazy } from "@/components/shop/product-reviews-lazy";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductPlacementBadges } from "@/components/shop/product-badges";
import { formatProductDescriptionHtml } from "@/lib/product-description-html";
import { getDisplayProductImageUrl } from "@/lib/product-media";
import {
  getProductSeoDescription,
  getProductSeoKeywords,
  getProductSeoTitle
} from "@/lib/seo";
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

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listPublicProductSlugs();

  return slugs.slice(0, 24).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return {
      title: "Ürün bulunamadı",
      robots: {
        index: false,
        follow: false
      }
    };
  }
  const seoTitle = getProductSeoTitle(product);
  const seoDescription = getProductSeoDescription(product);
  const productImage = getProductImageUrl(product);

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: getProductSeoKeywords(product),
    alternates: {
      canonical: `/urun/${product.slug}`
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "website",
      url: `/urun/${product.slug}`,
      images: [
        {
          url: productImage,
          width: 1200,
          height: 630,
          alt: product.name
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [productImage]
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
  const smartFeatures = getActiveProductSmartFeatures(product);
  const technicalGroups = getActiveProductTechnicalGroups(product);
  const storeProfile = getProductStoreProfile(product);
  const mediaItems = detailContent.galleryItems;
  const productImageUrl = getDisplayProductImageUrl(product.imageUrl);
  const infoCardItems = detailContent.infoCards.map((item) => ({
    label: item.label,
    value: item.value
  }));
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
              commerceBadges={productBadges}
            />
          </div>

          <aside className="product-commerce-buybox" aria-label="Ürün bilgisi ve sepet">
            <div className="product-commerce-meta">
              {[detailContent.heroEyebrow]
                .filter(Boolean)
                .map((label) => (
                  <span key={label}>{label}</span>
                ))}
            </div>
            <ProductPlacementBadges
              badges={productBadges}
              placement="detail_title_top"
              className="mt-3"
            />

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
            <ProductPlacementBadges
              badges={productBadges}
              placement="detail_title_bottom"
              className="mt-3"
            />
            <ProductPlacementBadges
              badges={productBadges}
              placement="detail_short_description_top"
              className="mt-4"
            />
            <p className="product-commerce-summary">
              {product.summary || storeProfile.primaryFit}
            </p>
            <ProductPlacementBadges
              badges={productBadges}
              placement="detail_short_description_bottom"
              className="mt-3"
            />

            <ProductPurchasePanel
              product={product}
              labels={detailContent.actionLabels}
              badges={productBadges}
            />
          </aside>

          <ProductInfoCards items={infoCardItems} />
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
          <ProductReviewsLazy
            content={detailContent.reviews}
            productName={product.name}
            productSlug={product.slug}
          />
        ) : null}
      </div>
    </main>
  );
}
