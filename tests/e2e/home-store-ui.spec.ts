import { expect, test } from "@playwright/test";

test("@e2e ana sayfa sade karar akisini gosterir", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: "Şarj cihazını değil, doğru çözümü seçin." })
  ).toBeVisible();
  await expect(page.locator(".premium-hero-route")).toHaveCount(3);

  for (const label of [
    "Pazar momentumu",
    "Ürün kargosu",
    "Şarj altyapısı",
    "Servis disiplini"
  ]) {
    await expect(page.getByText(label, { exact: true })).toHaveCount(0);
  }

  const viewportWidth = page.viewportSize()?.width ?? 0;
  if (viewportWidth <= 767) {
    await expect(page.locator(".premium-hero > .real-charger-media")).toBeHidden();
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

  const hasPageOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  });
  expect(hasPageOverflow).toBe(false);
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
