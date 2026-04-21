export function formatPriceTRY(valueInKurus: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(valueInKurus / 100);
}

