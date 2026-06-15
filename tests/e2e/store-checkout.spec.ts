import { expect, test } from "@playwright/test";

import { expectNoCriticalA11yViolations } from "./support/a11y";

test("@e2e magaza -> urun -> sepet -> odeme akisi PayTR mock ile tamamlanir", async ({ page }) => {
  let tokenRequestBody = "";

  await page.route("**/api/paytr/token", async (route) => {
    tokenRequestBody = route.request().postData() ?? "";

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        iframeToken: "test_iframe_token",
        merchantOid: "PCEV-E2E-ORDER"
      })
    });
  });

  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1")).toBeVisible();
  const addToCartButton = page.getByRole("button", { name: /Sepete Ekle/i }).first();
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();
  await expect(page.getByText(/sepete eklendi/i)).toBeVisible();

  await page.goto("/sepet", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="/odeme"]').first()).toBeVisible();
  await page.goto("/odeme", { waitUntil: "domcontentloaded" });

  await expect(page.locator('input[autocomplete="name"]')).toBeVisible();
  await page.locator('input[autocomplete="name"]').fill("ParkChargeEV Test");
  await page.locator('input[autocomplete="email"]').fill("qa@parkchargeev.com");
  await page.locator('input[autocomplete="tel"]').fill("05555555555");
  await page.locator('input[autocomplete="address-level1"]').fill("Istanbul");
  await page.locator('textarea[autocomplete="street-address"]').fill("Test Mahallesi, Test Sokak No: 1");
  await page.getByRole("button", { name: "PayTR ile Güvenli Öde" }).click();

  await expect(page.locator("#paytriframe")).toBeVisible();
  await expect(page.getByText("PCEV-E2E-ORDER")).toBeVisible();
  expect(tokenRequestBody).toContain("productId");
  expect(tokenRequestBody).not.toContain("paymentAmountKurus");
  expect(tokenRequestBody).not.toContain("unitPrice");
});

test("@e2e kablo uzunlugu fiyat ve sepet tutarini gunceller", async ({ page }) => {
  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });

  const priceScope =
    (page.viewportSize()?.width ?? 0) <= 767
      ? page.locator(".product-mobile-sticky-atc")
      : page.locator(".product-purchase-panel__price");

  await expect(priceScope.getByText(/12\.490/)).toBeVisible();
  const extendedCableButton = page.getByRole("button", { name: /7\.5 Metre/i });
  await extendedCableButton.click();
  await expect(extendedCableButton).toHaveAttribute("aria-pressed", "true");
  await expect(priceScope.getByText(/13\.290/)).toBeVisible();

  await page.getByRole("button", { name: /Sepete Ekle/i }).first().click();
  await expect(page.getByText(/sepete eklendi/i)).toBeVisible();

  await page.goto("/sepet", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("7.5 Metre (+800 TL)")).toBeVisible();
  await expect(page.getByText(/13\.290/).first()).toBeVisible();
});

test("@e2e PayTR Direkt API kart formu devre disi ve odeme sayfasi kart istemez", async ({
  page,
  request
}) => {
  const directResponse = await request.post("/api/paytr/direct-form", { data: {} });
  expect(directResponse.status()).toBe(410);

  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });
  const addToCartButton = page.getByRole("button", { name: /Sepete Ekle/i }).first();
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();
  await expect(page.getByText(/sepete eklendi/i)).toBeVisible();
  await page.goto("/odeme", { waitUntil: "domcontentloaded" });

  await page.locator('input[autocomplete="name"]').fill("ParkChargeEV Test");
  await page.locator('input[autocomplete="email"]').fill("qa@parkchargeev.com");
  await page.locator('input[autocomplete="tel"]').fill("05555555555");
  await page.locator('input[autocomplete="address-level1"]').fill("Istanbul");
  await page.locator('textarea[autocomplete="street-address"]').fill("Test Mahallesi, Test Sokak No: 1");

  await expect(page.getByRole("button", { name: "PayTR ile Güvenli Öde" })).toBeVisible();
  await expect(page.locator('input[autocomplete^="cc"]')).toHaveCount(0);
  await expect(page.getByText("Direkt API", { exact: false })).toHaveCount(0);
});

test("@e2e PayTR bos cevapta teknik JSON hatasi yerine Turkce mesaj gosterir", async ({ page }) => {
  await page.route("**/api/paytr/token", async (route) => {
    await route.fulfill({
      status: 502,
      body: ""
    });
  });

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

  await page.locator('input[autocomplete="name"]').fill("ParkChargeEV Test");
  await page.locator('input[autocomplete="email"]').fill("qa@parkchargeev.com");
  await page.locator('input[autocomplete="tel"]').fill("05555555555");
  await page.locator('input[autocomplete="address-level1"]').fill("Istanbul");
  await page.locator('textarea[autocomplete="street-address"]').fill("Test Mahallesi, Test Sokak No: 1");

  await page.getByRole("button", { name: "PayTR ile Güvenli Öde" }).click();

  await expect(
    page.getByText("PayTR ödeme oturumu başlatılamadı. Lütfen tekrar deneyin.")
  ).toBeVisible();
  await expect(page.getByText(/Unexpected end of JSON input/i)).toHaveCount(0);
});

test("@a11y kritik magaza ve odeme ekranlarinda accessibility smoke temiz", async ({ page }) => {
  await page.goto("/magaza");
  await expectNoCriticalA11yViolations(page);

  await page.goto("/sepet");
  await expectNoCriticalA11yViolations(page);
});
