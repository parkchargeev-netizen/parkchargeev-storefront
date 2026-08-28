import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const baseUrl = process.env.PERF_BASE_URL ?? "http://127.0.0.1:3103";
const outputDirectory = process.argv[2];

if (!outputDirectory) {
  throw new Error("Usage: node scripts/capture-perf-screenshots.mjs <output-directory>");
}

const routes = [
  ["home", "/"],
  ["store", "/magaza"],
  ["product", "/urun/hims-11kw-akilli-tasinabilir-arac-sarj-cihazi"],
  ["admin-login", "/admin/login"]
];

const viewports = [
  ["desktop", { width: 1440, height: 1000, isMobile: false }],
  ["mobile", { width: 390, height: 844, isMobile: true }]
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const [viewportName, viewport] of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      deviceScaleFactor: 1,
      reducedMotion: "reduce"
    });
    const page = await context.newPage();

    for (const [routeName, route] of routes) {
      await page.goto(new URL(route, baseUrl).toString(), {
        waitUntil: "networkidle",
        timeout: 60_000
      });
      await page.screenshot({
        path: path.join(outputDirectory, `${viewportName}-${routeName}.png`),
        fullPage: true,
        animations: "disabled"
      });
    }

    await context.close();
  }
} finally {
  await browser.close();
}
