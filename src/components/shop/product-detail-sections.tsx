import Link from "next/link";
import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { ProductPlacementBadges } from "@/components/shop/product-badges";
import { ProductCard } from "@/components/shop/product-card";
import type { ProductModel } from "@/lib/mock-data";
import type {
  ProductDetailContent,
  ProductTechnicalSpecGroup
} from "@/lib/product-detail-content";

type ProductDetailSectionsProps = {
  product: ProductModel;
  detailContent: ProductDetailContent;
  technicalGroups: ProductTechnicalSpecGroup[];
  relatedProducts: ProductModel[];
  descriptionHtml: string;
};

function TrustBlockIcon({ iconName }: { iconName?: string }) {
  const normalizedIconName = iconName?.toLocaleLowerCase("tr-TR") ?? "";
  const Icon =
    normalizedIconName.includes("truck") || normalizedIconName.includes("kargo")
      ? Truck
      : normalizedIconName.includes("return") ||
          normalizedIconName.includes("iade") ||
          normalizedIconName.includes("garanti")
        ? RotateCcw
        : normalizedIconName.includes("support") ||
            normalizedIconName.includes("destek")
          ? Headphones
          : ShieldCheck;

  return <Icon className="h-5 w-5" aria-hidden />;
}

function getTechnicalRows(groups: ProductTechnicalSpecGroup[]) {
  const seen = new Set<string>();

  return groups.flatMap((group) =>
    group.items.flatMap((spec) => {
      const value = [spec.value, spec.unit].filter(Boolean).join(" ").trim();
      const key = `${group.title}-${spec.name}-${value}`.toLocaleLowerCase("tr-TR");

      if (!spec.name || !value || seen.has(key)) {
        return [];
      }

      seen.add(key);

      return {
        groupName: group.title,
        label: spec.name,
        value,
        description: spec.description
      };
    })
  );
}

function compactText(text: string, maxLength = 110) {
  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  const compactedText = normalizedText.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return `${compactedText}...`;
}

export function ProductTrustGrid({
  detailContent
}: Pick<ProductDetailSectionsProps, "detailContent">) {
  const trustItems = detailContent.trustBlocks
    .filter((item) => item.isActive !== false && item.title && item.body)
    .slice(0, 3);

  if (detailContent.trustEnabled === false || trustItems.length === 0) {
    return null;
  }

  return (
    <section className="product-detail-section product-detail-trust-panel">
      <ProductPlacementBadges
        badges={detailContent.badges}
        placement="detail_trust_section_top"
        className="mb-4"
      />
      <div className="product-detail-section-heading">
        <p>{detailContent.trustEyebrow}</p>
        <h2>{detailContent.trustHeading}</h2>
      </div>
      <div className="product-detail-trust-grid">
        {trustItems.map((item) => (
          <article key={item.title} className="product-detail-trust-card">
            <TrustBlockIcon iconName={item.iconName} />
            <h3>{item.title}</h3>
            <p>{compactText(item.body, 96)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProductTechnicalSpecs({
  detailContent,
  groups
}: {
  detailContent: ProductDetailContent;
  groups: ProductTechnicalSpecGroup[];
}) {
  const rows = getTechnicalRows(groups);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section id="technical-specs" className="product-detail-section scroll-mt-28">
      <ProductPlacementBadges
        badges={detailContent.badges}
        placement="detail_specs_top"
        className="mb-4"
      />
      <div className="product-detail-section-heading">
        <p>Ürün teknik bilgileri</p>
        <h2>{detailContent.specsHeading || "Teknik Özellikler"}</h2>
      </div>
      <div className="product-detail-spec-list">
        {rows.map((spec) => (
          <div
            key={`${spec.groupName}-${spec.label}-${spec.value}`}
            className="product-detail-spec-row"
          >
            <div>
              <strong>{spec.label}</strong>
              {spec.description ? <small>{spec.description}</small> : null}
            </div>
            <p>{spec.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProductDescriptionBlock({
  product,
  detailContent,
  descriptionHtml
}: Pick<
  ProductDetailSectionsProps,
  "product" | "detailContent" | "descriptionHtml"
>) {
  return (
    <section className="product-detail-section product-detail-description-grid">
      <ProductPlacementBadges
        badges={detailContent.badges}
        placement="detail_description_top"
        className="mb-4 md:col-span-2"
      />
      <div>
        <div className="product-detail-section-heading">
          <p>{detailContent.descriptionEyebrow}</p>
          <h2>{detailContent.descriptionHeading}</h2>
        </div>
        <div
          className="managed-richtext mt-5 text-base leading-8 text-on-surface-variant"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      </div>
      {detailContent.useCases.length > 0 ? (
        <aside className="product-detail-fit-card">
          <h3>{detailContent.useCasesHeading}</h3>
          <div className="mt-4 grid gap-2">
            {detailContent.useCases.slice(0, 4).map((useCase) => (
              <span key={useCase}>{useCase}</span>
            ))}
          </div>
          {detailContent.useCasesCtaLabel && detailContent.useCasesCtaHref ? (
            <Link href={detailContent.useCasesCtaHref}>
              {detailContent.useCasesCtaLabel}
            </Link>
          ) : null}
        </aside>
      ) : null}
      <ProductPlacementBadges
        badges={detailContent.badges}
        placement="detail_description_bottom"
        className="mt-4 md:col-span-2"
      />
    </section>
  );
}

export function ProductFaqs({
  detailContent
}: Pick<ProductDetailSectionsProps, "detailContent">) {
  if (detailContent.faqs.length === 0) {
    return null;
  }

  return (
    <section className="product-detail-section">
      <div className="product-detail-section-heading">
        <p>Sık sorulan sorular</p>
        <h2>{detailContent.faqHeading}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {detailContent.faqs.map((faq) => (
          <article key={faq.question} className="rounded-lg bg-surface-container-low p-5">
            <h3 className="text-lg font-semibold text-on-surface">{faq.question}</h3>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProductRelatedProducts({
  detailContent,
  relatedProducts
}: Pick<ProductDetailSectionsProps, "detailContent" | "relatedProducts">) {
  if (detailContent.relatedEnabled === false || relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="product-detail-section">
      <div className="product-detail-section-heading">
        <p>{detailContent.relatedEyebrow}</p>
        <h2>{detailContent.relatedHeading}</h2>
      </div>
      <div className="product-detail-related-track mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {relatedProducts.slice(0, detailContent.relatedLimit || 4).map((relatedProduct, index) => (
          <ProductCard key={relatedProduct.id} navigationPrefetch={index < 2} product={relatedProduct} />
        ))}
      </div>
    </section>
  );
}
