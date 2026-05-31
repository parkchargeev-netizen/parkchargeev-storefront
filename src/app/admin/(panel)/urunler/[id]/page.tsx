import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { getAdminProductFormOptions } from "@/server/admin/product-form-options";
import { getAdminProductById } from "@/server/admin/repository";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAdminProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, formOptions] = await Promise.all([
    getAdminProductById(id),
    getAdminProductFormOptions({ excludeProductId: id })
  ]);

  if (!product) {
    notFound();
  }

  const variants =
    "variants" in product
      ? product.variants
      : product.defaultVariant
        ? [product.defaultVariant]
        : [];

  return (
    <div className="space-y-6">
      <section className="surface-card border border-slate-200 bg-white/95 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
          Ürün Düzenle
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">{product.name}</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Bu ekran ürünün katalog, teknik, SEO ve AI özeti alanlarını aynı anda günceller.
        </p>
      </section>

      <ProductForm
        key={product.id}
        mode="edit"
        productId={product.id}
        lookupOptions={formOptions.lookupOptions}
        catalogOptions={formOptions.catalogOptions}
        initialValues={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          status: product.status,
          brandId: product.brandId ?? "",
          shortDescription: product.shortDescription,
          description: product.description,
          useCase: product.useCase ?? "",
          sku: product.defaultVariant?.sku ?? "",
          variantTitle: product.defaultVariant?.title ?? product.name,
          powerLabel: product.defaultVariant?.powerLabel ?? "",
          cableLength: product.defaultVariant?.cableLength ?? "",
          priceKurus: product.defaultVariant?.priceKurus ?? product.defaultPriceKurus ?? 0,
          compareAtKurus:
            product.defaultVariant?.compareAtKurus ?? product.discountedPriceKurus ?? 0,
          stockQuantity: product.defaultVariant?.stockQuantity ?? 0,
          minimumStockThreshold: product.minimumStockThreshold,
          inventoryTrackingEnabled: product.inventoryTrackingEnabled,
          isVatIncluded: product.isVatIncluded,
          discountedPriceKurus: product.discountedPriceKurus,
          discountEndsAt: product.discountEndsAt ? product.discountEndsAt.toISOString().slice(0, 16) : "",
          powerKw: product.powerKw ?? "",
          chargeType: product.chargeType ?? "ac",
          connectorType: product.connectorType ?? "",
          phaseType: product.phaseType ?? "single_phase",
          ipClass: product.ipClass ?? "",
          hasWifi: product.hasWifi,
          hasRfid: product.hasRfid,
          has4g: product.has4g,
          installRequired: product.installRequired,
          categories: product.categories,
          tags: product.tags,
          vehicleBrands: product.vehicles,
          relatedProductIds: product.relatedProductIds,
          accessoryProductIds: product.accessoryProductIds,
          variants: variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            title: variant.title,
            powerLabel: variant.powerLabel ?? "",
            cableLength: variant.cableLength ?? "",
            connectorType: variant.connectorType ?? "",
            stockQuantity: variant.stockQuantity,
            priceKurus: variant.priceKurus,
            compareAtKurus: variant.compareAtKurus ?? 0,
            isDefault: variant.isDefault
          })),
          media: product.media.map((item) => ({
            id: item.id,
            url: item.url,
            altText: item.altText,
            isPrimary: item.isPrimary
          })),
          specs: product.specs.map((item) => ({
            id: item.id,
            groupName: item.groupName,
            label: item.label,
            value: item.value
          })),
          detailContent: product.detailContent,
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          canonicalUrl: product.canonicalUrl ?? "",
          ogImageUrl: product.ogImageUrl ?? "",
          aiSummary: product.aiSummary ?? "",
          searchKeywords: product.searchKeywords ?? [],
          adminNotes: product.adminNotes ?? ""
        }}
      />
    </div>
  );
}
