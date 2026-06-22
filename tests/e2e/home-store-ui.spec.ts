import { expect, test } from "@playwright/test";

test("@e2e ana sayfa sade karar akisini gosterir", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: "Şarj cihazını değil, doğru çözümü seçin." })
  ).toBeVisible();
  await expect(page.locator(".premium-hero-route")).toHaveCount(3);

  const viewportHeight = page.viewportSize()?.height ?? 0;
  const heroHeight = await page.locator(".premium-hero").evaluate((element) => {
    return element.getBoundingClientRect().height;
  });
  const viewportWidth = page.viewportSize()?.width ?? 0;
  const expectedHeaderOffset = viewportWidth >= 768 ? 110 : 76;
  expect(heroHeight).toBeGreaterThanOrEqual(viewportHeight - expectedHeaderOffset);

  for (const label of [
    "Pazar momentumu",
    "Ürün kargosu",
    "Şarj altyapısı",
    "Servis disiplini"
  ]) {
    await expect(page.getByText(label, { exact: true })).toHaveCount(0);
  }

  if (viewportWidth <= 767) {
    await expect(page.locator(".premium-hero > .real-charger-media")).toBeHidden();
    await expect(page.locator(".premium-hero__mobile-trust")).toBeVisible();
    await expect(page.locator(".premium-hero__mobile-trust .premium-trust-pill")).toHaveCount(3);

    const homepageCards = page.locator(".premium-product-spotlight__grid .premium-product-card");
    expect(await homepageCards.count()).toBeGreaterThan(1);
    const firstCardWidth = await homepageCards.first().evaluate((element) => {
      return element.getBoundingClientRect().width;
    });
    expect(firstCardWidth).toBeLessThan(190);
  } else {
    await expect(page.locator("header").getByText("PayTR güvenli ödeme")).toBeVisible();
    await expect(page.locator("header").getByText("Ürün kargosu: 81 il")).toBeVisible();
    await expect(page.locator("header").getByText("Ücretsiz keşif: Sakarya")).toBeVisible();
    await expect(page.locator("header").getByText("Kurulum: Sakarya ve Kocaeli")).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: /Türkiye geneli keşif talebi/i })).toBeVisible();
    await expect(page.locator(".premium-hero__mobile-trust")).toBeHidden();
  }

  const hasPageOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  });
  expect(hasPageOverflow).toBe(false);
});

test("@e2e magaza acik renkli e-ticaret girisi ve kayan urun vitrini sunar", async ({ page }) => {
  await page.goto("/magaza", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", {
      name: "Şarj ürünlerini bulun ve karşılaştırın."
    })
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Mağazada ürün ara" })).toBeVisible();
  await expect(page.locator(".store-hero")).toHaveCount(0);
  await expect(page.getByText("Evde gece şarjı", { exact: true })).toHaveCount(0);

  const productRail = page.locator(".store-product-rail");
  await expect(productRail).toBeVisible();
  expect(await productRail.locator(".premium-product-card").count()).toBeGreaterThan(2);

  const firstCardWidth = await productRail.locator(".premium-product-card").first().evaluate((element) => {
    return element.getBoundingClientRect().width;
  });
  expect(firstCardWidth).toBeLessThanOrEqual(250);

  const isScrollable = await productRail.evaluate((element) => {
    return element.scrollWidth > element.clientWidth;
  });
  expect(isScrollable).toBe(true);

  const viewportWidth = page.viewportSize()?.width ?? 0;
  if (viewportWidth <= 1024) {
    const mobileFilter = page.locator(".store-mobile-filter");
    await expect(mobileFilter).toBeVisible();
    await expect(page.locator(".store-filter-sidebar")).toBeHidden();
    await expect(page.locator(".store-mobile-category-strip")).toBeVisible();

    const filterTriggerHeight = await mobileFilter.locator("summary").evaluate((element) => {
      return element.getBoundingClientRect().height;
    });
    expect(filterTriggerHeight).toBeGreaterThanOrEqual(44);

    await mobileFilter.locator("summary").click();
    await expect(page.locator(".store-mobile-filter__panel")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sonuçları Göster" })).toBeVisible();
    await mobileFilter.locator("summary").click();

    const storeCards = page.locator(".store-product-grid--commerce .premium-product-card");
    if ((await storeCards.count()) > 1) {
      const firstStoreCardWidth = await storeCards.first().evaluate((element) => {
        return element.getBoundingClientRect().width;
      });
      expect(firstStoreCardWidth).toBeLessThan(200);
    }
  } else {
    await expect(page.locator(".store-mobile-tools")).toBeHidden();
    await expect(page.locator(".store-filter-sidebar")).toBeVisible();

    const railCoverage = await productRail.evaluate((element) => {
      const parentWidth = element.parentElement?.getBoundingClientRect().width ?? 0;
      return element.getBoundingClientRect().width / parentWidth;
    });
    expect(railCoverage).toBeGreaterThan(0.98);
  }

  const hasPageOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  });
  expect(hasPageOverflow).toBe(false);
});

test("@e2e mobil urun detay sayfasi kompakt e-ticaret akisi sunar", async ({ page }) => {
  const viewportWidth = page.viewportSize()?.width ?? 0;
  test.skip(viewportWidth > 767, "Mobil kompakt ürün detay kontrolü.");

  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });

  const buybox = page.locator(".product-detail-buybox");
  await expect(buybox.locator("h1")).toBeVisible();

  const titleSize = await buybox.locator("h1").evaluate((element) => {
    return Number.parseFloat(window.getComputedStyle(element).fontSize);
  });
  expect(titleSize).toBeLessThanOrEqual(23);

  const galleryHeight = await page.locator(".product-gallery-premium").evaluate((element) => {
    return element.getBoundingClientRect().height;
  });
  expect(galleryHeight).toBeLessThan(470);

  const inlineAddToCart = page.locator(".product-mobile-inline-atc");
  await expect(inlineAddToCart).toBeVisible();
  await expect(inlineAddToCart.getByRole("button", { name: "Sepete Ekle" })).toBeVisible();
  await expect(page.locator(".product-purchase-panel__add-button")).toBeHidden();
  await expect(page.locator(".product-mobile-sticky-atc")).toBeHidden();

  const viewportHeight = page.viewportSize()?.height ?? 0;
  const inlineBox = await inlineAddToCart.boundingBox();
  expect(inlineBox).not.toBeNull();
  expect(inlineBox?.y ?? 0).toBeGreaterThanOrEqual(0);
  expect(inlineBox?.y ?? 0).toBeLessThan(viewportHeight);

  const hasPageOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  });
  expect(hasPageOverflow).toBe(false);
});

test("@e2e urun detay galerisi thumbnail kartlarini gorselli gosterir", async ({ page }) => {
  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });

  const thumbnailVisuals = page.locator(
    ".product-gallery-premium > .mt-5 button img, .product-gallery-premium > .mt-5 button .product-gallery-thumbnail-visual"
  );
  expect(await thumbnailVisuals.count()).toBeGreaterThan(1);
  await expect(thumbnailVisuals.first()).toBeVisible();

  const viewportWidth = page.viewportSize()?.width ?? 0;
  if (viewportWidth >= 1024) {
    const gallery = page.locator(".product-gallery-premium");
    const desktopFill = page.locator(".product-detail-desktop-under-gallery");
    const desktopSupport = page.locator(".product-detail-desktop-support-grid");

    await expect(desktopFill).toBeVisible();
    await expect(desktopSupport).toBeVisible();
    const galleryBox = await gallery.boundingBox();
    const desktopFillBox = await desktopFill.boundingBox();

    expect(galleryBox).not.toBeNull();
    expect(desktopFillBox).not.toBeNull();
    expect((desktopFillBox?.y ?? 0) - ((galleryBox?.y ?? 0) + (galleryBox?.height ?? 0))).toBeLessThan(
      40
    );
  }
});

test("@e2e mobil urun secici sade ve kompakt gorunur", async ({ page }) => {
  const viewportWidth = page.viewportSize()?.width ?? 0;
  test.skip(viewportWidth > 767, "Mobil kompakt ürün seçici kontrolü.");

  await page.goto("/urun-secici", { waitUntil: "domcontentloaded" });

  const titleSize = await page.locator(".selector-config-panel h1").evaluate((element) => {
    return Number.parseFloat(window.getComputedStyle(element).fontSize);
  });
  expect(titleSize).toBeLessThanOrEqual(23);

  const resultTitleSize = await page.locator(".selector-result-card h2").evaluate((element) => {
    return Number.parseFloat(window.getComputedStyle(element).fontSize);
  });
  expect(resultTitleSize).toBeLessThanOrEqual(24);

  const firstOptionHeight = await page.locator(".selector-option").first().evaluate((element) => {
    return element.getBoundingClientRect().height;
  });
  expect(firstOptionHeight).toBeLessThanOrEqual(92);

  const hasPageOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  });
  expect(hasPageOverflow).toBe(false);
});

test("@e2e odeme sayfasi PayTR icin kart bilgisi toplar", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "parkchargeev-cart-v1",
      JSON.stringify([
        {
          productId: "prod_homecharge_pro_11",
          cableOption: "5 Metre",
          quantity: 1
        }
      ])
    );
  });

  await page.goto("/odeme", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("main").getByText("PayTR uyumlu güvenli ödeme", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Kartı Doğrula ve Öde/i })).toBeVisible();
  await expect(page.locator('input[autocomplete^="cc"]')).toHaveCount(5);
  await expect(page.getByText("Kart bilgileri", { exact: true })).toBeVisible();
});

test("@e2e kurumsal sayfa kompakt teklif formu ve responsive akisi sunar", async ({ page }) => {
  await page.goto("/kurumsal-cozumler", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", {
      name: "Site, ofis ve otoparklar için ölçeklenebilir şarj altyapısı."
    })
  ).toBeVisible();
  await expect(page.locator(".corporate-solution-grid .solution-card")).toHaveCount(3);

  const form = page.locator("#kurumsal-teklif .lead-form-card");
  await expect(form).toBeVisible();

  const firstInputHeight = await form.locator("input").first().evaluate((element) => {
    return element.getBoundingClientRect().height;
  });
  expect(firstInputHeight).toBeLessThanOrEqual(54);

  const hasPageOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  });
  expect(hasPageOverflow).toBe(false);
});
