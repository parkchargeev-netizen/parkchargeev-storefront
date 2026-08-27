import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [client, server, edge, nextConfig, cart, cartPage, fallbackStore] = await Promise.all([
  source("src/instrumentation-client.ts"),
  source("sentry.server.config.ts"),
  source("sentry.edge.config.ts"),
  source("next.config.ts"),
  source("src/lib/cart.ts"),
  source("src/components/shop/cart-page-client.tsx"),
  source("src/server/admin/fallback-store.ts")
]);

assert(
  !client.includes('import * as Sentry from "@sentry/nextjs"'),
  "Client Sentry SDK ilk chunk'a statik import edilmemeli."
);
assert(
  client.includes('import("@sentry/nextjs")') && client.includes("requestIdleCallback"),
  "Client Sentry hydrate sonrasi idle zamanda dinamik yuklenmeli."
);
for (const [name, config] of [["server", server], ["edge", edge]]) {
  assert(config.includes("tracesSampleRate: 0.05"), `${name} trace orneklemesi 0.05 olmali.`);
  assert(config.includes("enableLogs: false"), `${name} Sentry loglari kapali olmali.`);
  assert(config.includes("sendDefaultPii: false"), `${name} varsayilan PII gondermemeli.`);
}
assert(
  nextConfig.includes("widenClientFileUpload: false"),
  "Sentry widenClientFileUpload kapali olmali."
);
assert(
  !cart.includes('import { products') && !cartPage.includes('import { products'),
  "Statik mock urun katalogu sepet client zincirine girmemeli."
);
assert(
  fallbackStore.includes('await import("@/lib/mock-data")') &&
    fallbackStore.includes("sourceVersion") &&
    fallbackStore.includes("generatedAt") &&
+    fallbackStore.includes("FALLBACK_MAX_AGE_MS") &&
+    fallbackStore.includes("Date.parse(store.generatedAt)"),
  "Fallback store hata yolunda dinamik yuklenmeli ve tazelik bilgisi tasimali."
);

console.log("JS budget gate passed: deferred Sentry, bounded telemetry, fresh lazy fallback.");
