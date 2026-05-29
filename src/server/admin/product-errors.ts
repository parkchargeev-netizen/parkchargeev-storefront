export class AdminProductConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminProductConflictError";
  }
}

export function isAdminProductConflictError(error: unknown): error is AdminProductConflictError {
  return error instanceof AdminProductConflictError;
}

export function getAdminProductDatabaseConflictMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return null;
  }

  const dbError = error as {
    code?: string;
    constraint?: string;
    constraint_name?: string;
    message?: string;
  };

  if (dbError.code !== "23505") {
    return null;
  }

  const constraint = dbError.constraint_name ?? dbError.constraint ?? "";

  if (constraint.includes("products_slug_idx")) {
    return "Bu slug ile kayıtlı başka bir ürün var. Lütfen benzersiz bir slug kullanın.";
  }

  if (constraint.includes("product_variants_sku_idx")) {
    return "Bu SKU ile kayıtlı başka bir ürün varyantı var. Lütfen benzersiz bir SKU kullanın.";
  }

  return "Bu kayıt benzersiz olması gereken bir değerle çakışıyor. Lütfen slug ve SKU alanlarını kontrol edin.";
}
