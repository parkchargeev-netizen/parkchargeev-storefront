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
import { formatPriceTRY } from "@/lib/format";
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
  const formattedPrice = formatPriceTRY(product.priceKurus);
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
        <nav className="product-commerce-breadcrumb" aria-label="Ürün yolu">
          <Link href="/">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/magaza">Mağaza</Link>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <strong>{product.name}</strong>
        </nav>

        <section className="product-commerce-hero">
          <div className="product-commerce-media">
            <ProductGallery
              productName={product.name}
              items={detailContent.galleryItems}
              imageUrl={productImageUrl}
              mediaItems={product.media}
              featureLabels={detailContent.galleryFeatureLabels}
              deviceCaption={detailContent.galleryDeviceCaption}
            />
            <div className="product-commerce-proof-strip">
              {detailContent.purchaseReadiness.slice(0, 3).map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <aside id="satinal" className="product-commerce-buybox">
            <div className="product-commerce-meta">
              <span>ParkChargeEV seçkisi</span>
              <span>Ürün kodu: {productSku}</span>
            </div>

            <div className="product-commerce-rating">
              <strong>5/5</strong>
              <span>Teknik kontrol, güvenli ödeme ve kurulum desteği</span>
            </div>

            <div className="product-commerce-badges">
              {product.badge ? (
                <span className="product-detail-commerce-pill product-detail-commerce-pill--primary">
                  {product.badge}
                </span>
              ) : null}
              <ProductCommerceBadges badges={commerceBadges} stockLabel={product.stockLabel} />
            </div>

            <h1>{product.name}</h1>
            <p className="product-commerce-summary">{storeProfile.primaryFit}</p>

            <div className="product-commerce-keyfacts">
              {[
                ["Güç", storeProfile.powerTier],
                ["Uyum", storeProfile.connectorHint],
                ["Kurulum", storeProfile.installationMode]
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <ProductPurchasePanel product={product} benefits={detailContent.purchaseBenefits} />
          </aside>
        </section>
      </div>

      <div className="product-commerce-content">
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
      </div>

      <div className="product-commerce-mobile-dock" aria-label="Mobil satın alma kısayolu">
        <div>
          <span>{product.stockLabel}</span>
          <strong>{formattedPrice}</strong>
        </div>
        <a href="#satinal">Satın alma alanı</a>
      </div>
    </main>
  );
}
