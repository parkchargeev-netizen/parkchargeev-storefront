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
      "/elektrikli-arac-sarj-rehberi",
      "/elektrikli-arac-sarj-sozlugu",
      "/sarj-cihazi-kurulumu/sakarya",
      "/sarj-cihazi-kurulumu/kocaeli",
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
    expect(rootBody).toContain("Elektrikli araç şarj rehberi");
    expect(rootBody).toContain("RSS rehber akışı");
  });

  test("RSS feed exposes canonical EV charging guides", async ({ request }) => {
    const response = await request.get("/feed.xml");
    const body = await response.text();

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("application/rss+xml");
    expect(body).toContain("<rss version=\"2.0\"");
    expect(body).toContain("Elektrikli Araç Şarj Maliyeti Nasıl Hesaplanır?");
    expect(body).toContain("/blog/elektrikli-arac-sarj-maliyeti-hesaplama");
  });

  test("guide hub and glossary publish semantic topic data", async ({ page }) => {
    await page.goto("/elektrikli-arac-sarj-rehberi", {
      waitUntil: "domcontentloaded"
    });

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Elektrikli araç şarj cihazı hakkında doğru kararı/
      })
    ).toBeVisible();
    await expect(page.getByText("Şarj maliyeti hesabı", { exact: true })).toBeVisible();

    await page.goto("/elektrikli-arac-sarj-sozlugu", {
      waitUntil: "domcontentloaded"
    });
    await expect(page.getByRole("heading", { level: 2, name: "Type 2" })).toBeVisible();

    const glossaryJsonLd = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(glossaryJsonLd.join("\n")).toContain('"@type":"DefinedTermSet"');
  });

  test("variant products use ProductGroup structured data", async ({ page }) => {
    await page.goto("/urun/homecharge-pro-11kw", {
      waitUntil: "domcontentloaded"
    });

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const combinedJsonLd = jsonLd.join("\n");

    expect(combinedJsonLd).toContain('"@type":"ProductGroup"');
    expect(combinedJsonLd).toContain('"hasVariant"');
    expect(combinedJsonLd).toContain("SKU-HOMECHARGE-PRO-11KW-5M");
    expect(combinedJsonLd).not.toContain('"aggregateRating"');
  });

  test("local installation pages publish city-scoped Service data", async ({
    page
  }) => {
    await page.goto("/sarj-cihazi-kurulumu/sakarya", {
      waitUntil: "domcontentloaded"
    });

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Sakarya Elektrikli Araç Şarj Cihazı Kurulumu"
      })
    ).toBeVisible();

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const combinedJsonLd = jsonLd.join("\n");

    expect(combinedJsonLd).toContain('"@type":"Service"');
    expect(combinedJsonLd).toContain('"@type":"City"');
    expect(combinedJsonLd).toContain('"name":"Sakarya"');
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

  test("store targets the electric vehicle charger search intent", async ({ page }) => {
    await page.goto("/magaza", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(
      /Elektrikli Araç Şarj Cihazları ve Fiyatları/
    );
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Elektrikli araç şarj cihazları ve fiyatları"
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Elektrikli araç şarj cihazı nasıl seçilir?"
      })
    ).toBeVisible();
    await expect(
      page.getByText(/elektrikli araç şarj aleti, EV charger veya wallbox/i)
    ).toBeVisible();

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const combinedJsonLd = jsonLd.join("\n");

    expect(combinedJsonLd).toContain('"@type":"CollectionPage"');
    expect(combinedJsonLd).toContain('"@type":"ItemList"');
    expect(combinedJsonLd).toContain("Elektrikli araç şarj aleti");
  });

  test("charger selection guide is indexable and linked from the store", async ({
    page
  }) => {
    await page.goto("/magaza", { waitUntil: "domcontentloaded" });

    const guideLink = page.getByRole("link", {
      name: "Ev tipi seçim rehberi"
    });
    await expect(guideLink).toHaveAttribute(
      "href",
      "/blog/elektrikli-arac-sarj-cihazi-secim-rehberi"
    );

    await guideLink.click();
    await expect(page).toHaveURL(
      /\/blog\/elektrikli-arac-sarj-cihazi-secim-rehberi$/
    );
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Elektrikli Araç Şarj Cihazı Seçim Rehberi/
      })
    ).toBeVisible();
    await expect(
      page.getByText("ParkChargeEV teknik içerik ekibi tarafından hazırlanmıştır.")
    ).toBeVisible();
  });
});
