import { productCategoryOptions } from "@/server/admin/constants";
import { getProductLookupOptions, listAdminCatalog } from "@/server/admin/repository";

type ProductLookupOption = {
  id: string;
  name: string;
};

type ProductCatalogOption = {
  brands: ProductLookupOption[];
  categories: Array<{
    slug: string;
    name: string;
  }>;
};

export type AdminProductFormOptions = {
  lookupOptions: ProductLookupOption[];
  catalogOptions: ProductCatalogOption;
};

const productFormDataTimeoutMs = 2500;

const fallbackCatalogOptions: ProductCatalogOption = {
  brands: [],
  categories: productCategoryOptions.map((category) => ({
    slug: category.slug,
    name: category.label
  }))
};

function logAdminProductFormOptionError(label: string, error: unknown) {
  console.warn(
    `Admin product form ${label} could not be loaded.`,
    error instanceof Error ? error.message : error
  );
}

async function withReadFallback<T>(label: string, promise: Promise<T>, fallback: T) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const guardedPromise = promise.catch((error) => {
    logAdminProductFormOptionError(label, error);
    return fallback;
  });

  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      logAdminProductFormOptionError(label, "read timeout");
      resolve(fallback);
    }, productFormDataTimeoutMs);
  });

  try {
    return await Promise.race([guardedPromise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function getAdminProductFormOptions(input?: {
  excludeProductId?: string;
}): Promise<AdminProductFormOptions> {
  const [lookupOptions, catalog] = await Promise.all([
    withReadFallback("lookup options", getProductLookupOptions(), []),
    withReadFallback(
      "catalog options",
      listAdminCatalog(),
      {
        brands: [],
        categories: []
      }
    )
  ]);

  const categories =
    catalog.categories.length > 0
      ? catalog.categories.map((category) => ({
          slug: category.slug,
          name: category.name
        }))
      : fallbackCatalogOptions.categories;

  return {
    lookupOptions: lookupOptions.filter((item) => item.id !== input?.excludeProductId),
    catalogOptions: {
      brands: catalog.brands.map((brand) => ({
        id: brand.id,
        name: brand.name
      })),
      categories
    }
  };
}
