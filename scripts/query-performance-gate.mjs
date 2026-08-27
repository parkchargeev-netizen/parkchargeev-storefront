import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const checkout = read("src/server/paytr/checkout-order.ts");
const repository = read("src/server/admin/repository.ts");
const searchPage = read("src/app/(site)/arama/page.tsx");
const storePage = read("src/app/(site)/magaza/page.tsx");

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(
  checkout.includes("listPublicProductsByIds") && !checkout.includes("listPublicProducts();"),
  "Checkout must price only requested product ids."
);
expect(
  repository.includes("export async function listPublicProductsByIds"),
  "Repository must expose an id-scoped public product query."
);
expect(
  repository.includes("export async function searchPublicProducts"),
  "Repository must expose a bounded database product search."
);
expect(
  !/getPublicRelatedProducts[\s\S]{0,240}listPublicProducts\(\)/.test(repository),
  "Related products must not scan the full public catalog."
);
expect(
  searchPage.includes("searchPublicProducts") && searchPage.includes("if (!query)"),
  "Search must skip data reads for a blank query and use the bounded product search."
);
expect(
  storePage.includes("STORE_PAGE_SIZE = 24") && storePage.includes("page?: string"),
  "Store results must use URL-preserving 24-item pagination."
);

if (failures.length > 0) {
  console.error("Query performance gate failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Query performance gate passed.");
