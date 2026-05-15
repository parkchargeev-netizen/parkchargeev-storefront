import { expect, type Page, test } from "@playwright/test";

import { expectNoCriticalA11yViolations } from "./support/a11y";
import { loadTestEnv } from "./support/env";

loadTestEnv();

const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;

test.skip(!adminEmail || !adminPassword, "Admin bootstrap env degiskenleri yok.");

async function goToAdminSection(page: Page, href: string, urlPattern: RegExp) {
  const link = page.locator(`aside nav a[href="${href}"]`).first();

  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(urlPattern, { timeout: 30_000 });
}

test("@e2e admin login -> dashboard -> temel modul navigasyonu", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel(/E-posta/i).fill(adminEmail ?? "");
  await page.locator("#password").fill(adminPassword ?? "");
  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/admin/auth/login") &&
      response.request().method() === "POST",
    { timeout: 30_000 }
  );
  await page.locator('button[type="submit"]').click();
  const loginResponse = await loginResponsePromise;

  expect(loginResponse.ok()).toBeTruthy();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });
  await expect(page.getByText(/Bugunun|Kontrol Merkezi/i).first()).toBeVisible();

  await goToAdminSection(page, "/admin/urunler", /\/admin\/urunler/);

  await goToAdminSection(page, "/admin/siparisler", /\/admin\/siparisler/);

  await goToAdminSection(page, "/admin/teklifler", /\/admin\/teklifler/);
});

test("@a11y admin login ekrani accessibility smoke temiz", async ({ page }) => {
  await page.goto("/admin/login");
  await expectNoCriticalA11yViolations(page);
});
