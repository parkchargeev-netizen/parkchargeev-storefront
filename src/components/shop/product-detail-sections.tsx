import Link from "next/link";
import {
  BatteryCharging,
  Bluetooth,
  CheckCircle2,
  Cpu,
  Headphones,
  Home,
  Radio,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Truck,
  Wifi,
  Zap
} from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import type { ProductModel } from "@/lib/mock-data";
import type {
  ProductDetailContent,
  ProductSmartFeature,
  ProductTechnicalSpecGroup
} from "@/lib/product-detail-content";

type ProductDetailSectionsProps = {
  product: ProductModel;
  detailContent: ProductDetailContent;
  smartFeatures: ProductSmartFeature[];
  technicalGroups: ProductTechnicalSpecGroup[];
  relatedProducts: ProductModel[];
  descriptionHtml: string;
};

function SmartFeatureIcon({ iconName }: { iconName?: string }) {
  const normalizedIconName = iconName?.toLocaleLowerCase("tr-TR") ?? "";
  const Icon =
    normalizedIconName.includes("wifi") || normalizedIconName.includes("wi-fi")
      ? Wifi
      : normalizedIconName.includes("bluetooth")
        ? Bluetooth
        : normalizedIconName.includes("shield") ||
            normalizedIconName.includes("güven")
          ? ShieldCheck
          : normalizedIconName.includes("zap") ||
              normalizedIconName.includes("power")
            ? Zap
            : normalizedIconName.includes("radio") ||
                normalizedIconName.includes("rfid")
              ? Radio
              : normalizedIconName.includes("cpu") ||
                  normalizedIconName.includes("ocpp")
                ? Cpu
                : normalizedIconName.includes("setting")
                  ? Settings
                  : Sparkles;

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

function getSummaryIcon(label: string) {
  const normalizedLabel = label.toLocaleLowerCase("tr-TR");

  if (normalizedLabel.includes("güç") || normalizedLabel.includes("kw")) {
    return BatteryCharging;
  }

  if (
    normalizedLabel.includes("bağlant") ||
    normalizedLabel.includes("soket") ||
    normalizedLabel.includes("type")
  ) {
    return Zap;
  }

  if (
    normalizedLabel.includes("kurulum") ||
    normalizedLabel.includes("montaj") ||
    normalizedLabel.includes("keşif")
  ) {
    return Home;
  }

  return CheckCircle2;
}

export function ProductHighlightGrid({
  detailContent
}: Pick<ProductDetailSectionsProps, "detailContent">) {
  const highlights = detailContent.purchaseReadiness
    .map((item, index) => ({
      label: item.label?.trim() ?? "",
      value: item.value?.trim() ?? "",
      description: detailContent.highlights[index] ?? detailContent.decisionChecks[index] ?? "",
      icon: getSummaryIcon(item.label ?? "")
    }))
    .filter((item) => item.label && item.value)
    .slice(0, 6);
  const benefitHighlights = detailContent.highlights.slice(0, 4);

  if (highlights.length === 0 && benefitHighlights.length === 0) {
    return null;
  }

  return (
    <section className="product-detail-section product-detail-section--compact">
      {highlights.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.label} className="product-detail-mini-card">
                <span className="product-detail-mini-card__icon">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                {item.description ? <small>{item.description}</small> : null}
              </article>
            );
          })}
        </div>
      ) : null}
      {benefitHighlights.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {benefitHighlights.map((highlight) => (
            <div key={highlight} className="product-detail-benefit-line">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ProductTrustGrid({
  detailContent
}: Pick<ProductDetailSectionsProps, "detailContent">) {
  const trustItems = [
    {
      title: "Sipariş takibi",
      body: "Sepete ekleme ve ödeme adımları kısa, açık ve izlenebilir şekilde ilerler.",
      icon: ShieldCheck
    },
    {
      title: "Kargo ve teslimat",
      body: "Kargo kapsamı ürün etiketleri ve sepet adımıyla netleşir.",
      icon: Truck
    },
    {
      title: "Garanti ve iade",
      body: "Garanti, iade ve destek detayları ürün politikasında açıkça gösterilir.",
      icon: RotateCcw
    },
    {
      title: "Teknik destek",
      body:
        detailContent.support.body ||
        "Satış öncesi uygunluk ve kurulum soruları için destek alınabilir.",
      icon: Headphones
    }
  ];

  return (
    <section className="product-detail-section">
      <div className="product-detail-section-heading">
        <p>Güven ve satın alma</p>
        <h2>Teknik üründe karar riskini azaltan net bilgiler.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {trustItems.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.title} className="product-detail-trust-card">
              <Icon className="h-5 w-5" aria-hidden />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ProductSmartFeatures({ features }: { features: ProductSmartFeature[] }) {
  if (features.length === 0) {
    return null;
  }

  return (
    <section className="product-detail-section">
      <div className="product-detail-section-heading">
        <p>Bağlantı ve kontrol</p>
        <h2>Üründe aktif olan erişim ve kontrol yetenekleri.</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <article
            key={`${feature.title}-${feature.description}`}
            className="product-detail-smart-card"
          >
            <span>
              <SmartFeatureIcon iconName={feature.iconName} />
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProductTechnicalSpecs({
  groups
}: {
  groups: ProductTechnicalSpecGroup[];
}) {
  const rows = getTechnicalRows(groups);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section id="technical-specs" className="product-detail-section scroll-mt-28">
      <div className="product-detail-section-heading">
        <p>Teknik özellikler</p>
        <h2>Sade, hızlı taranabilir teknik tablo.</h2>
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
      <div>
        <div className="product-detail-section-heading">
          <p>Ürün açıklaması</p>
          <h2>{product.name} kimler için uygun?</h2>
        </div>
        <div
          className="managed-richtext mt-5 text-base leading-8 text-on-surface-variant"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      </div>
      {detailContent.useCases.length > 0 ? (
        <aside className="product-detail-fit-card">
          <h3>Uygun kullanım senaryoları</h3>
          <div className="mt-4 grid gap-2">
            {detailContent.useCases.slice(0, 8).map((useCase) => (
              <span key={useCase}>{useCase}</span>
            ))}
          </div>
          <Link href="/urun-secici">Akıllı seçiciye git</Link>
        </aside>
      ) : null}
    </section>
  );
}

export function ProductPolicies({
  detailContent
}: Pick<ProductDetailSectionsProps, "detailContent">) {
  if (detailContent.policyDetails.length === 0) {
    return null;
  }

  return (
    <section className="product-detail-section product-detail-policy-grid">
      {detailContent.policyDetails.map((detail) => (
        <article key={detail.title}>
          <h3>{detail.title}</h3>
          <p>{detail.body}</p>
        </article>
      ))}
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
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="product-detail-section">
      <div className="product-detail-section-heading">
        <p>{detailContent.relatedEyebrow}</p>
        <h2>{detailContent.relatedHeading}</h2>
      </div>
      <div className="product-detail-related-track mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} />
        ))}
      </div>
    </section>
  );
}
