import { expect, test } from "@playwright/test";

import { expectNoCriticalA11yViolations } from "./support/a11y";

test("@e2e harita sayfasinda istasyon secimi ve filtreler calisir", async ({ page }) => {
  await page.goto("/harita");

  await expect(page.locator("main").getByText(/istasyon/i).first()).toBeVisible();
  await page.locator('input[type="search"], input').first().fill("Istanbul");
  await expect(page.locator("button").filter({ hasText: /Sadece/i }).first()).toBeVisible();
  await page.locator("button").filter({ hasText: /Sadece/i }).first().click();
  await page.locator("button").filter({ hasText: /f.rla|Sifirla/i }).first().click();

  const stationButtons = page.locator("aside button").filter({ hasText: /soket/i });
  await expect(stationButtons.first()).toBeVisible();
  await stationButtons.first().click();
  await expect(page.locator('a[href^="https://www.google.com/maps/dir/"]').first()).toBeVisible();
});

test("@visual harita desktop gorsel smoke snapshot", async ({ page }) => {
  await page.goto("/harita");
  await expect(page).toHaveScreenshot("harita-desktop.png", {
    fullPage: true
  });
});

test("@a11y harita accessibility smoke temiz", async ({ page }) => {
  await page.goto("/harita");
  await expectNoCriticalA11yViolations(page);
});
