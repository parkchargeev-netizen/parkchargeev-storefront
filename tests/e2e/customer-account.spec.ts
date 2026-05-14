import { expect, test } from "@playwright/test";

import { expectNoCriticalA11yViolations } from "./support/a11y";

test("@e2e müşteri paneli giriş, kayıt ve güvenlik başlıkları", async ({ page, request }) => {
  const accountResponse = await request.get("/hesabim");

  expect(accountResponse.status()).toBe(200);
  expect(accountResponse.headers()["x-robots-tag"]).toContain("noindex");
  expect(accountResponse.headers()["cache-control"]).toContain("no-store");

  await page.route("**/api/customer/auth/register", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        customer: {
          id: "00000000-0000-4000-8000-000000000001",
          email: "qa-customer@parkchargeev.com",
          firstName: "Park",
          lastName: "Charge"
        }
      })
    });
  });

  await page.goto("/giris");
  await expect(page.getByText(/Müşteri paneli/i).first()).toBeVisible();
  await page.getByRole("button", { name: /^Kayıt Ol$/i }).click();
  await page.locator('input[name="firstName"]').fill("Park");
  await page.locator('input[name="lastName"]').fill("Charge");
  await page.locator('input[name="email"]').fill("qa-customer@parkchargeev.com");
  await page.locator('input[name="phone"]').fill("05555555555");
  await page.locator('input[name="password"]').fill("ParkCharge2026");
  await page.getByRole("button", { name: /Hesap Oluştur/i }).click();

  await expect(page).toHaveURL(/\/hesabim/);
  await expect(page.getByText(/Hesabınızı görüntülemek için giriş yapın/i)).toBeVisible();
});

test("@a11y müşteri giriş ve hesap ekranlarında kritik erişilebilirlik hatası yok", async ({ page }) => {
  await page.goto("/giris");
  await expectNoCriticalA11yViolations(page);

  await page.goto("/hesabim");
  await expectNoCriticalA11yViolations(page);
});
