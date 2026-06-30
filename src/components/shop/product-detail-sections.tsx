import Link from "next/link";
import { BatteryCharging, CheckCircle2, Cpu, Headphones, Home, Radio, RotateCcw, Settings, ShieldCheck, Sparkles, Truck, Wifi, Zap } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import type { ProductModel } from "@/lib/mock-data";
import type {
  ProductDetailContent,
  ProductSmartFeature,
  ProductTechnicalSpecGroup
} from "@/lib/product-detail-content";
import type { ProductCommerceBadge } from "@/lib/product-commerce-tags";
import { getProductStoreProfile } from "@/lib/shop-merchandising";

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

function getTechnicalRows(groups: ProductTechnicalSpecGroup[]) {
  return groups.flatMap((group) =>
    group.items.map((spec) => ({
      groupName: group.title,
      label: spec.name,
      value: [spec.value, spec.unit].filter(Boolean).join(" "),
      description: spec.description
    }))
  );
}

export function ProductCommerceBadges({ badges, stockLabel }: { badges: ProductCommerceBadge[]; stockLabel: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="product-detail-commerce-pill product-detail-commerce-pill--stock">
        {stockLabel}
      </span>
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={
            badge.tone === "success"
              ? "product-detail-commerce-pill product-detail-commerce-pill--success"
              : "product-detail-commerce-pill product-detail-commerce-pill--warning"
          }
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

export function ProductHighlightGrid({ product, detailContent }: Pick<ProductDetailSectionsProps, "product" | "detailContent">) {
  const profile = getProductStoreProfile(product);
  const highlights = [
    { label: "Güç", value: profile.powerTier, icon: BatteryCharging },
    { label: "Bağlantı", value: profile.connectorHint, icon: Zap },
    { label: "Kurulum", value: profile.installationMode, icon: Home },
    { label: "Kullanım", value: profile.primaryFit, icon: CheckCircle2 }
  ];

  return (
    <section className="product-detail-section product-detail-section--compact">
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
            </article>
          );
        })}
      </div>
      {detailContent.highlights.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {detailContent.highlights.slice(0, 4).map((highlight) => (
            <div key={highlight} className="rounded-lg border border-outline-variant/35 bg-white px-4 py-3 text-sm font-semibold leading-6 text-on-surface">
              {highlight}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ProductTrustGrid({ detailContent }: Pick<ProductDetailSectionsProps, "detailContent">) {
  const trustItems = [
    { title: "Güvenli ödeme", body: "PayTR altyapısı ile ödeme oturumu güvenli şekilde hazırlanır.", icon: ShieldCheck },
    { title: "Kargo ve teslimat", body: "Kargo kapsamı ürün etiketleri ve sepet adımıyla netleşir.", icon: Truck },
    { title: "Garanti ve iade", body: "Garanti, iade ve destek detayları ürün politikasında açıkça gösterilir.", icon: RotateCcw },
    { title: "Teknik destek", body: detailContent.support.body || "Satış öncesi uygunluk ve kurulum soruları için destek alınabilir.", icon: Headphones }
  ];

  return (
    <section className="product-detail-section">
      <div className="product-detail-section-heading">
        <p>Güven ve satın alma</p>
        <h2>Teknik üründe karar riskini azaltan bilgiler tek ekranda.</h2>
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
        <p>Akıllı özellikler</p>
        <h2>Admin panelden yönetilen dinamik özellik kartları.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <article key={`${feature.title}-${feature.description}`} className="product-detail-smart-card">
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

export function ProductTechnicalSpecs({ groups }: { groups: ProductTechnicalSpecGroup[] }) {
  const rows = getTechnicalRows(groups);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="product-detail-section">
      <div className="product-detail-section-heading">
        <p>Teknik özellikler</p>
        <h2>Tek uzun listede, hızlı taranabilir ürün teknik tablosu.</h2>
      </div>
      <div className="product-detail-spec-list">
        {rows.map((spec) => (
          <div key={`${spec.groupName}-${spec.label}-${spec.value}`} className="product-detail-spec-row">
            <div>
              <span>{spec.groupName}</span>
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
}: Pick<ProductDetailSectionsProps, "product" | "detailContent" | "descriptionHtml">) {
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
      <aside className="product-detail-fit-card">
        <h3>Uygun kullanım senaryoları</h3>
        <div className="mt-4 grid gap-2">
          {detailContent.useCases.slice(0, 8).map((useCase) => (
            <span key={useCase}>{useCase}</span>
          ))}
        </div>
        <Link href="/urun-secici">Akıllı seçiciye git</Link>
      </aside>
    </section>
  );
}

export function ProductPolicies({ detailContent }: Pick<ProductDetailSectionsProps, "detailContent">) {
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

export function ProductFaqs({ detailContent }: Pick<ProductDetailSectionsProps, "detailContent">) {
  if (detailContent.faqs.length === 0) {
    return null;
  }

  return (
    <section className="product-detail-section">
      <div className="product-detail-section-heading">
        <p>Karar soruları</p>
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
      <div className="product-detail-related-track mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} />
        ))}
      </div>
    </section>
  );
}
