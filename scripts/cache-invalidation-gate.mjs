import assert from "node:assert/strict";
import fs from "node:fs";

const cacheModulePath = "src/server/catalog/cache.ts";
assert.ok(fs.existsSync(cacheModulePath), "Central public catalog cache module is required.");

const cacheModule = fs.readFileSync(cacheModulePath, "utf8");
for (const token of [
  'revalidateTag("public-products")',
  '"/magaza"',
  '"/arama"',
  '"/sitemap.xml"',
  '"/image-sitemap.xml"',
  'revalidatePath("/urun/[slug]", "page")'
]) {
  assert.ok(cacheModule.includes(token), `Missing cache invalidation token: ${token}`);
}

for (const file of [
  "src/server/admin/repository.ts",
  "src/server/admin/product-import.ts",
  "src/server/admin/operations.ts",
  "src/server/admin/site-management.ts"
]) {
  const source = fs.readFileSync(file, "utf8");
  assert.ok(
    source.includes('from "@/server/catalog/cache"'),
    `${file} must use the central public catalog cache service.`
  );
}

console.log("Public catalog cache invalidation gate passed.");