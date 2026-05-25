import type { ProductModel } from "@/lib/mock-data";

export type ProductCableOption = {
  label: string;
  priceDeltaKurus: number;
  priceKurus: number;
  compareAtKurus?: number;
};

function parseLocalizedPriceToKurus(value: string) {
  const compact = value.replace(/\s/g, "");
  const hasCommaDecimal = /,\d{1,2}$/.test(compact);
  const normalized = hasCommaDecimal
    ? compact.replace(/\./g, "").replace(",", ".")
    : compact.replace(/[.,]/g, "");
  const price = Number(normalized);

  return Number.isFinite(price) ? Math.round(price * 100) : 0;
}

export function parseCableOptionPriceDeltaKurus(option: string) {
  const match = option.match(/\(\s*\+?\s*([\d.,]+)\s*(?:tl|try|₺)\s*\)/i);
  return match?.[1] ? parseLocalizedPriceToKurus(match[1]) : 0;
}

export function getProductCableOptions(product: ProductModel): ProductCableOption[] {
  return product.cableOptions.map((label) => {
    const variant = product.variants?.find((item) => item.cableLength === label);
    const priceDeltaKurus = variant
      ? variant.priceKurus - product.priceKurus
      : parseCableOptionPriceDeltaKurus(label);
    const priceKurus = variant?.priceKurus ?? product.priceKurus + priceDeltaKurus;
    const compareAtKurus =
      variant?.compareAtKurus ??
      (product.compareAtKurus ? product.compareAtKurus + priceDeltaKurus : undefined);

    return {
      label,
      priceDeltaKurus,
      priceKurus,
      compareAtKurus
    };
  });
}

export function getProductCableOptionLabels(product: ProductModel) {
  return getProductCableOptions(product).map((option) => option.label);
}

export function getProductSelectedCableOption(
  product: ProductModel,
  selectedCableOption?: string
) {
  const options = getProductCableOptions(product);
  return (
    options.find((option) => option.label === selectedCableOption) ??
    options[0] ?? {
      label: selectedCableOption ?? "",
      priceDeltaKurus: 0,
      priceKurus: product.priceKurus,
      compareAtKurus: product.compareAtKurus
    }
  );
}
