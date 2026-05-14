import { expect, test } from "@playwright/test";

import { expectNoCriticalA11yViolations } from "./support/a11y";

test("@e2e magaza -> urun -> sepet -> odeme akisi PayTR mock ile tamamlanir", async ({ page }) => {
  await page.route("**/api/paytr/token", async (route) => {
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

  await page.goto("/urun/homecharge-pro-11kw");
  await expect(page.locator("h1")).toBeVisible();
  await page.getByRole("button", { name: /Sepete Ekle/i }).click();
  await expect(page.getByText(/sepete eklendi/i)).toBeVisible();

  await page.goto("/sepet");
  await expect(page.locator('a[href="/odeme"]').first()).toBeVisible();
  await page.goto("/odeme");

  await expect(page.locator('input[autocomplete="name"]')).toBeVisible();
  await page.locator('input[autocomplete="name"]').fill("ParkChargeEV Test");
  await page.locator('input[autocomplete="email"]').fill("qa@parkchargeev.com");
  await page.locator('input[autocomplete="tel"]').fill("05555555555");
  await page.locator('input[autocomplete="address-level1"]').fill("Istanbul");
  await page.locator('textarea[autocomplete="street-address"]').fill("Test Mahallesi, Test Sokak No: 1");
  await page.locator("button").filter({ hasText: /Haz.rla|Hazirla/i }).click();

  await expect(page.locator("#paytriframe")).toBeVisible();
  await expect(page.getByText("PCEV-E2E-ORDER")).toBeVisible();
});

test("@a11y kritik magaza ve odeme ekranlarinda accessibility smoke temiz", async ({ page }) => {
  await page.goto("/magaza");
  await expectNoCriticalA11yViolations(page);

  await page.goto("/sepet");
  await expectNoCriticalA11yViolations(page);
});
