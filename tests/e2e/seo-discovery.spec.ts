import { expect, test } from "@playwright/test";

test.describe("@e2e SEO and AI discovery", () => {
  test("robots.txt allows search and AI crawlers while protecting private routes", async ({
    request
  }) => {
    const response = await request.get("/robots.txt");
    const body = await response.text();

    expect(response.ok()).toBeTruthy();

    for (const crawler of [
      "Googlebot",
      "Bingbot",
      "YandexBot",
      "OAI-SearchBot",
      "GPTBot",
      "Google-Extended",
      "ClaudeBot",
      "Claude-SearchBot",
      "PerplexityBot"
    ]) {
      expect(body).toContain(`User-agent: ${crawler}`);
    }

    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Disallow: /api/customer");
    expect(body).toContain("Content-Signal: ai-train=yes, search=yes, ai-input=yes");
    expect(body).toContain("Sitemap: https://parkchargeev.com/sitemap.xml");
  });

  test("sitemap includes canonical commercial pages and modification dates", async ({
    request
  }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();

    expect(response.ok()).toBeTruthy();

    const sitemapPaths = [...body.matchAll(/<loc>(.*?)<\/loc>/g)].map(
      (match) => new URL(match[1]).pathname
    );

    for (const path of [
      "/",
      "/hakkimizda",
      "/magaza",
      "/hizmetler",
      "/kurumsal-cozumler",
      "/iletisim",
      "/blog"
    ]) {
      expect(sitemapPaths).toContain(path);
    }

    expect(body).toContain("<lastmod>");
    expect(body).toContain("<changefreq>");
    expect(body).toContain("<priority>");
  });

  test("llms discovery files expose the company category and canonical resources", async ({
    request
  }) => {
    const [rootResponse, wellKnownResponse] = await Promise.all([
      request.get("/llms.txt"),
      request.get("/.well-known/llms.txt")
    ]);
    const [rootBody, wellKnownBody] = await Promise.all([
      rootResponse.text(),
      wellKnownResponse.text()
    ]);

    expect(rootResponse.ok()).toBeTruthy();
    expect(wellKnownResponse.ok()).toBeTruthy();
    expect(rootBody).toBe(wellKnownBody);
    expect(rootBody).toContain("# ParkChargeEV");
    expect(rootBody).toContain("> ParkChargeEV");
    expect(rootBody).toContain("EV charging solutions");
    expect(rootBody).toMatch(/\[EV şarj mağazası\]\(https?:\/\/[^)]+\/magaza\)/);
    expect(rootBody).toContain("## Hizmetler ve Çözümler");
    expect(rootBody).toContain("## Makine Tarafından Okunabilir Kaynaklar");
  });

  test("service pages publish Service structured data", async ({ page }) => {
    await page.goto("/hizmetler", { waitUntil: "domcontentloaded" });

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const combinedJsonLd = jsonLd.join("\n");

    expect(combinedJsonLd).toContain('"@type":"Service"');
    expect(combinedJsonLd).toContain('"@type":"OfferCatalog"');
    expect(combinedJsonLd).toContain('"areaServed"');
  });
});
