import { readFile } from "node:fs/promises";

const productCardPath = "src/components/shop/product-card.tsx";
const siteShellPath = "src/components/layout/site-shell.tsx";
const mediaRuntimePath = "src/components/shop/product-card-media-runtime.tsx";

const [productCard, siteShell, mediaRuntime] = await Promise.all([
  readFile(productCardPath, "utf8"),
  readFile(siteShellPath, "utf8"),
  readFile(mediaRuntimePath, "utf8")
]);

const checks = [
  {
    ok: !productCard.includes("ProductCompareMarker"),
    message: "ProductCard kart basina client ProductCompareMarker hydrate etmemeli."
  },
  {
    ok: productCard.includes("data-compare-product-id"),
    message: "ProductCard karsilastirma durumunu server-rendered data attribute ile sunmali."
  },
  {
    ok: siteShell.includes("ProductCompareRuntime"),
    message: "Public site karsilastirma durumunu tek ProductCompareRuntime ile yonetmeli."
  },
  {
    ok:
      productCard.includes("getImageProps") &&
      productCard.includes("data-product-secondary-src") &&
      mediaRuntime.includes("(hover: hover) and (pointer: fine)"),
    message: "Ikinci urun gorseli yalnizca gercek hover etkilesiminde kaynak secmeli."
  },
  {
    ok: productCard.includes('fetchPriority="low"'),
    message: "Kritik olmayan ikinci urun gorseli dusuk ag onceligi istemeli."
  }
];

const failures = checks.filter((check) => !check.ok);

if (failures.length > 0) {
  console.error("Product card performance gate failed:");
  failures.forEach((failure) => console.error(`- ${failure.message}`));
  process.exit(1);
}

console.log("Product card performance gate passed.");
