export type ProductInfoCardItem = {
  label: string;
  value?: string | null;
};

function isVisibleValue(value?: string | null) {
  if (!value) {
    return false;
  }

  const normalizedValue = value.trim().toLocaleLowerCase("tr-TR");
  return Boolean(normalizedValue) && !["null", "undefined", "-"].includes(normalizedValue);
}

export function ProductInfoCards({ items }: { items: ProductInfoCardItem[] }) {
  const visibleItems = items.filter((item) => isVisibleValue(item.value));

  if (!visibleItems.length) {
    return null;
  }

  return (
    <div className="product-commerce-info-grid" aria-label="Ürün hızlı bilgi kartları">
      {visibleItems.map((item) => (
        <div key={`${item.label}-${item.value}`} className="product-commerce-info-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
