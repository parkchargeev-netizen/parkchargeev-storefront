import { readFile } from "node:fs/promises";
import path from "node:path";
import { brotliCompressSync } from "node:zlib";

const manifestPath = path.join(".next", "app-build-manifest.json");
const commonBudget = {
  raw: Number(process.env.PERF_MAX_COMMON_JS_RAW_BYTES ?? 400_000),
  brotli: Number(process.env.PERF_MAX_COMMON_JS_BROTLI_BYTES ?? 100_000)
};

const routeBudgets = [
  { name: "home", key: "/(site)/page", raw: 420_000, brotli: 110_000 },
  { name: "store", key: "/(site)/magaza/page", raw: 440_000, brotli: 115_000 },
  { name: "product", key: "/(site)/urun/[slug]/page", raw: 455_000, brotli: 120_000 },
  { name: "checkout", key: "/(site)/checkout/page", raw: 455_000, brotli: 118_000 }
];

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function assertBudget(label, measured, budget) {
  const failures = [];
  if (measured.raw > budget.raw) {
    failures.push(`raw ${formatBytes(measured.raw)} > ${formatBytes(budget.raw)}`);
  }
  if (measured.brotli > budget.brotli) {
    failures.push(`brotli ${formatBytes(measured.brotli)} > ${formatBytes(budget.brotli)}`);
  }
  if (failures.length > 0) {
    throw new Error(`${label} JS budget exceeded: ${failures.join(", ")}`);
  }
}

async function measurePage(manifest, pageKey) {
  const files = manifest.pages?.[pageKey];
  if (!Array.isArray(files)) {
    throw new Error(`App build manifest page not found: ${pageKey}`);
  }

  const javascriptFiles = [...new Set(files.filter((file) => file.endsWith(".js")))];
  const buffers = await Promise.all(
    javascriptFiles.map((file) => readFile(path.join(".next", file)))
  );

  return {
    files: javascriptFiles.length,
    raw: buffers.reduce((total, buffer) => total + buffer.length, 0),
    brotli: buffers.reduce(
      (total, buffer) => total + brotliCompressSync(buffer).length,
      0
    )
  };
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const common = await measurePage(manifest, "/layout");
assertBudget("common root layout", common, commonBudget);

const results = [{ name: "common", measured: common, budget: commonBudget }];
for (const route of routeBudgets) {
  const measured = await measurePage(manifest, route.key);
  const budget = {
    raw: Number(process.env[`PERF_MAX_${route.name.toUpperCase()}_JS_RAW_BYTES`] ?? route.raw),
    brotli: Number(
      process.env[`PERF_MAX_${route.name.toUpperCase()}_JS_BROTLI_BYTES`] ?? route.brotli
    )
  };
  assertBudget(route.name, measured, budget);
  results.push({ name: route.name, measured, budget });
}

console.table(
  results.map(({ name, measured, budget }) => ({
    target: name,
    files: measured.files,
    raw: formatBytes(measured.raw),
    rawBudget: formatBytes(budget.raw),
    brotli: formatBytes(measured.brotli),
    brotliBudget: formatBytes(budget.brotli)
  }))
);
console.log("Performance bundle budgets passed.");
