"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";

import { formatPriceTRY } from "@/lib/format";
import type { ProductModel } from "@/lib/mock-data";

type ProductComparisonClientProps = {
  products: ProductModel[];
};

type Preset = {
  label: string;
  description: string;
  matcher: (product: ProductModel) => boolean;
};

const comparisonPresets: Preset[] = [
  {
    label: "Ev kullanımı",
    description: "7.4 kW ve 11 kW AC cihazları öne çıkarır.",
    matcher: (product) => product.category.toLocaleLowerCase("tr-TR").includes("ev")
  },
  {
    label: "İş yeri",
    description: "RFID, OCPP ve çoklu kullanıcı senaryolarını gösterir.",
    matcher: (product) =>
      product.category.toLocaleLowerCase("tr-TR").includes("iş") ||
      product.useCases.some((useCase) =>
        ["ofis", "otel", "avm"].some((keyword) =>
          useCase.toLocaleLowerCase("tr-TR").includes(keyword)
        )
      )
  },
  {
    label: "AC / DC farkı",
    description: "Uzun park ve hızlı dönüş senaryosunu karşılaştırır.",
    matcher: (product) =>
      product.powerLabel.toLocaleLowerCase("tr-TR").includes("ac") ||
      product.powerLabel.toLocaleLowerCase("tr-TR").includes("dc")
  }
];

function getSpec(product: ProductModel, labelIncludes: string[]) {
  const normalizedLabels = labelIncludes.map((label) => label.toLocaleLowerCase("tr-TR"));
  const spec = product.specs.find((item) => {
    const normalizedLabel = item.label.toLocaleLowerCase("tr-TR");
    return normalizedLabels.some((label) => normalizedLabel.includes(label));
  });

  return spec?.value ?? "-";
}

function getInitialProductIds(products: ProductModel[]) {
  return products.slice(0, 3).map((product) => product.id);
}

export function ProductComparisonClient({ products }: ProductComparisonClientProps) {
  const [selectedIds, setSelectedIds] = useState(() => getInitialProductIds(products));

  const selectedProducts = useMemo(
    () =>
      selectedIds
        .map((id) => products.find((product) => product.id === id))
        .filter((product): product is ProductModel => Boolean(product)),
    [products, selectedIds]
  );

  function toggleProduct(productId: string) {
    setSelectedIds((current) => {
      if (current.includes(productId)) {
        return current.length === 1 ? current : current.filter((id) => id !== productId);
      }

      return [...current.slice(-3), productId];
    });
  }

  function applyPreset(preset: Preset) {
    const matchedIds = products
      .filter(preset.matcher)
      .slice(0, 4)
      .map((product) => product.id);

    setSelectedIds(matchedIds.length ? matchedIds : getInitialProductIds(products));
  }

  const tableRows = [
    {
      label: "Kategori",
      value: (product: ProductModel) => product.category
    },
    {
      label: "Güç sınıfı",
      value: (product: ProductModel) => product.powerLabel
    },
    {
      label: "Fiyat",
      value: (product: ProductModel) => formatPriceTRY(product.priceKurus)
    },
    {
      label: "Stok",
      value: (product: ProductModel) => product.stockLabel
    },
    {
      label: "Bağlantı",
      value: (product: ProductModel) => getSpec(product, ["bağlantı", "soket"])
    },
    {
      label: "Koruma / garanti",
      value: (product: ProductModel) => getSpec(product, ["koruma", "garanti"])
    },
    {
      label: "Kablo seçeneği",
      value: (product: ProductModel) => product.cableOptions.join(", ")
    },
    {
      label: "En uygun kullanım",
      value: (product: ProductModel) => product.useCases.slice(0, 3).join(", ")
    },
    {
      label: "Öne çıkanlar",
      value: (product: ProductModel) => product.highlights.slice(0, 3).join(", ")
    }
  ];

  return (
    <section className="mt-12 grid gap-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Canlı karşılaştırma
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-on-surface md:text-4xl">
            Ürünleri seç, farkları tek tabloda gör
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {comparisonPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="rounded-2xl border border-outline-variant/60 bg-white px-4 py-3 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary"
              title={preset.description}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => {
          const isSelected = selectedIds.includes(product.id);

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => toggleProduct(product.id)}
              className={`flex min-h-[132px] flex-col justify-between rounded-[24px] border p-5 text-left transition ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-outline-variant/50 bg-white hover:border-primary/50"
              }`}
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                    {product.category}
                  </span>
                  <span className="mt-2 block text-lg font-bold tracking-[-0.03em] text-on-surface">
                    {product.name}
                  </span>
                </span>
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isSelected ? "bg-primary text-white" : "bg-surface-container-low text-primary"
                  }`}
                >
                  {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </span>
              <span className="mt-4 flex items-end justify-between gap-3">
                <span className="text-sm font-semibold text-primary">{product.powerLabel}</span>
                <span className="text-base font-black text-on-surface">
                  {formatPriceTRY(product.priceKurus)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[28px] border border-outline-variant/50 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                <th className="w-44 px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                  Kriter
                </th>
                {selectedProducts.map((product) => (
                  <th key={product.id} className="min-w-56 px-5 py-4 align-top">
                    <span className="block text-sm font-semibold text-primary">
                      {product.powerLabel}
                    </span>
                    <span className="mt-1 block text-lg font-black tracking-[-0.03em] text-on-surface">
                      {product.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.label} className="border-b border-outline-variant/40 last:border-0">
                  <th className="px-5 py-4 text-sm font-semibold text-on-surface">
                    {row.label}
                  </th>
                  {selectedProducts.map((product) => (
                    <td
                      key={`${row.label}-${product.id}`}
                      className="px-5 py-4 text-sm leading-6 text-on-surface-variant"
                    >
                      {row.value(product)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="px-5 py-4 text-sm font-semibold text-on-surface">Aksiyon</th>
                {selectedProducts.map((product) => (
                  <td key={`action-${product.id}`} className="px-5 py-4">
                    <Link
                      href={`/urun/${product.slug}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-container"
                    >
                      Ürünü incele
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
