import { chromium, devices } from "@playwright/test";

const baseUrl = new URL(process.env.PERF_BASE_URL ?? "http://127.0.0.1:3103");
const productSlug =
  process.env.PERF_PRODUCT_SLUG ?? "hims-11kw-akilli-tasinabilir-arac-sarj-cihazi";
const sampleCount = Number(process.env.PERF_SAMPLE_COUNT ?? 3);
const knownTrackingHosts = new Set([
  "www.googletagmanager.com",
  "www.google-analytics.com",
  "region1.google-analytics.com",
  "www.clarity.ms",
  "scripts.clarity.ms",
  "app.sendnomi.com"
]);

const routes = [
  { name: "home", path: "/", maxTtfb: 1_000, maxLcp: 3_600, maxTbt: 2_100 },
  { name: "store", path: "/magaza", maxTtfb: 1_000, maxLcp: 5_000, maxTbt: 2_100 },
  {
    name: "product",
    path: `/urun/${productSlug}`,
    maxTtfb: 1_000,
    maxLcp: 3_800,
    maxTbt: 2_200
  },
  { name: "checkout", path: "/checkout", maxTtfb: 1_000, maxLcp: 4_500, maxTbt: 2_200 }
];

function threshold(route, metric) {
  const envName = `PERF_MAX_${route.name.toUpperCase()}_${metric.toUpperCase()}_MS`;
  return Number(process.env[envName] ?? route[`max${metric[0].toUpperCase()}${metric.slice(1)}`]);
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

async function waitForServer(request) {
  const deadline = Date.now() + 60_000;
  const healthUrl = new URL("/api/health", baseUrl).toString();
  while (Date.now() < deadline) {
    try {
      const response = await request.get(healthUrl, { timeout: 3_000 });
      if (response.ok()) return;
    } catch {
      // The production server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`Performance server was not ready within 60s: ${healthUrl}`);
}

if (!Number.isInteger(sampleCount) || sampleCount < 1 || sampleCount % 2 === 0) {
  throw new Error("PERF_SAMPLE_COUNT must be a positive odd integer.");
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  ...devices["Pixel 5"],
  serviceWorkers: "block"
});

await context.route("**/*", async (route) => {
  let hostname = "";
  try {
    hostname = new URL(route.request().url()).hostname;
  } catch {
    await route.continue();
    return;
  }
  if (knownTrackingHosts.has(hostname) || hostname.endsWith(".ingest.sentry.io")) {
    await route.abort("blockedbyclient");
    return;
  }
  await route.continue();
});

await context.addInitScript(() => {
  window.__PARK_PERF__ = { lcp: 0, tbt: 0, longTasks: 0 };
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const last = entries.at(-1);
    if (last) window.__PARK_PERF__.lcp = last.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__PARK_PERF__.longTasks += 1;
      window.__PARK_PERF__.tbt += Math.max(0, entry.duration - 50);
    }
  }).observe({ type: "longtask", buffered: true });
});

try {
  await waitForServer(context.request);
  const results = [];
  const failures = [];

  for (const route of routes) {
    const url = new URL(route.path, baseUrl).toString();
    await context.request.get(url, { timeout: 30_000 });
    const samples = [];

    for (let sample = 0; sample < sampleCount; sample += 1) {
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForTimeout(2_500);
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        return {
          status: 0,
          ttfb: navigation ? navigation.responseStart - navigation.startTime : 0,
          lcp: window.__PARK_PERF__.lcp,
          tbt: window.__PARK_PERF__.tbt,
          longTasks: window.__PARK_PERF__.longTasks
        };
      });
      samples.push({ ...metrics, status: response?.status() ?? 0 });
      await page.close();
    }

    const metrics = {
      status: median(samples.map((sample) => sample.status)),
      ttfb: median(samples.map((sample) => sample.ttfb)),
      lcp: median(samples.map((sample) => sample.lcp)),
      tbt: median(samples.map((sample) => sample.tbt)),
      longTasks: median(samples.map((sample) => sample.longTasks))
    };
    const limits = {
      ttfb: threshold(route, "ttfb"),
      lcp: threshold(route, "lcp"),
      tbt: threshold(route, "tbt")
    };

    if (metrics.status < 200 || metrics.status >= 400) {
      failures.push(`${route.name}: HTTP ${metrics.status}`);
    }
    for (const metric of ["ttfb", "lcp", "tbt"]) {
      if (!Number.isFinite(metrics[metric]) || metrics[metric] <= 0) {
        failures.push(`${route.name}: ${metric.toUpperCase()} unavailable`);
      } else if (metrics[metric] > limits[metric]) {
        failures.push(
          `${route.name}: ${metric.toUpperCase()} ${metrics[metric].toFixed(0)}ms > ${limits[metric]}ms`
        );
      }
    }

    results.push({
      route: route.path,
      samples: sampleCount,
      status: metrics.status,
      ttfb: `${metrics.ttfb.toFixed(0)} / ${limits.ttfb} ms`,
      lcp: `${metrics.lcp.toFixed(0)} / ${limits.lcp} ms`,
      tbt: `${metrics.tbt.toFixed(0)} / ${limits.tbt} ms`,
      longTasks: metrics.longTasks
    });
  }

  console.table(results);
  if (failures.length > 0) {
    throw new Error(`Critical route performance budget failed:\n- ${failures.join("\n- ")}`);
  }
  console.log(
    `Critical route performance budgets passed (${sampleCount}-sample median, mobile Chrome, 4x CPU).`
  );
} finally {
  await context.close();
  await browser.close();
}
