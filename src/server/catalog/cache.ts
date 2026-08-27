import { revalidatePath, revalidateTag } from "next/cache";

type PublicCatalogInvalidationOptions = {
  revalidateAllProductPages?: boolean;
  slugs?: Iterable<string>;
};

const publicCatalogPaths = [
  "/",
  "/magaza",
  "/arama",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap.xml",
  "/image-sitemap.xml"
] as const;

export function revalidatePublicCatalog({
  revalidateAllProductPages = false,
  slugs = []
}: PublicCatalogInvalidationOptions = {}) {
  revalidateTag("public-products");
  revalidateTag("admin-product-lookup");

  for (const path of publicCatalogPaths) {
    revalidatePath(path);
  }

  if (revalidateAllProductPages) {
    revalidatePath("/urun/[slug]", "page");
  }

  for (const slug of new Set(slugs)) {
    if (slug) {
      revalidatePath(`/urun/${slug}`);
    }
  }
}

export function revalidatePublicMerchandising() {
  revalidatePath("/");
  revalidatePath("/magaza");
}