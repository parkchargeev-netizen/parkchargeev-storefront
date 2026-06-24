import { expect, type Page, test } from "@playwright/test";

import { expectNoCriticalA11yViolations } from "./support/a11y";
import { loadTestEnv } from "./support/env";

loadTestEnv();

const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;

test.skip(!adminEmail || !adminPassword, "Admin bootstrap env degiskenleri yok.");
test.setTimeout(90_000);

async function loginAsAdmin(page: Page) {
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

  return loginResponsePromise;
}

async function goToAdminSection(page: Page, href: string, urlPattern: RegExp) {
  const link = page.locator(`a[href="${href}"]:visible`).first();

  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(urlPattern, { timeout: 30_000 });
}

test("@e2e admin login -> dashboard -> temel modul navigasyonu", async ({ page }) => {
  const loginResponse = await loginAsAdmin(page);

  expect(loginResponse.ok()).toBeTruthy();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { name: /Bugunun|Bugünün|Kontrol merkezi|Kontrol Merkezi/i })
  ).toBeVisible();

  await goToAdminSection(page, "/admin/urunler", /\/admin\/urunler/);

  await goToAdminSection(page, "/admin/siparisler", /\/admin\/siparisler/);

  await goToAdminSection(page, "/admin/teklifler", /\/admin\/teklifler/);
});

test("@e2e admin urun ekleme linki form ekranini acar", async ({ page }) => {
  const loginResponse = await loginAsAdmin(page);

  expect(loginResponse.ok()).toBeTruthy();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  await goToAdminSection(page, "/admin/urunler", /\/admin\/urunler/);
  await page.locator('a[href="/admin/urunler/yeni"]').first().click();

  await expect(page).toHaveURL(/\/admin\/urunler\/yeni/, { timeout: 30_000 });
  await expect(page.getByRole("button", { name: /Ürün oluştur|ÃœrÃ¼n oluÅŸtur/i })).toBeEnabled({ timeout: 15_000 });
  await expect(page.getByText(/Application error|Unhandled Runtime/i)).toHaveCount(0);
});

test("@e2e admin blog rehberleri listeler", async ({ page }) => {
  const loginResponse = await loginAsAdmin(page);

  expect(loginResponse.ok()).toBeTruthy();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  await page.goto("/admin/blog", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Blog ve rehber/i })).toBeVisible();
  await expect(
    page.getByText(
      /evde-elektrikli-arac-sarj-cihazi-kurulumu|11kw-ve-22kw-sarj-cihazi-farki|apartman-otoparkina-sarj-cihazi-kurulumu/i
    ).first()
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('a[href^="/admin/blog/"]').first()).toBeVisible();
  await expect(page.getByText(/Application error|Unhandled Runtime/i)).toHaveCount(0);
});

test("@e2e admin urun duzenleme linki form ekranini acar", async ({ page }) => {
  const loginResponse = await loginAsAdmin(page);

  expect(loginResponse.ok()).toBeTruthy();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  await goToAdminSection(page, "/admin/urunler", /\/admin\/urunler/);
  const editLink = page
    .locator('a[href^="/admin/urunler/"]')
    .filter({ hasNotText: /yeni/i })
    .first();

  await expect(editLink).toBeVisible({ timeout: 30_000 });
  await editLink.click();

  await expect(page).toHaveURL(/\/admin\/urunler\/[0-9a-f-]+/, { timeout: 30_000 });
  await expect(page.getByRole("button", { name: /Değişiklikleri kaydet|DeÄŸiÅŸiklikleri kaydet/i })).toBeEnabled({ timeout: 15_000 });
  await expect(page.getByText(/Application error|Unhandled Runtime/i)).toHaveCount(0);
});

test("@e2e admin urun formu dinamik alanlari kilitlemez", async ({ page }) => {
  const loginResponse = await loginAsAdmin(page);

  expect(loginResponse.ok()).toBeTruthy();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  await page.goto("/admin/urunler/yeni", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Katalog kaydı oluştur/i })).toBeVisible();

  for (const buttonName of [
    "Varyant ekle",
    "URL ekle",
    "Özellik ekle",
    "Kart ekle",
    "Akordiyon ekle",
    "Soru ekle"
  ]) {
    await page.getByRole("button", { name: buttonName }).click();
  }

  await expect(page.getByRole("button", { name: /Ürün oluştur/i })).toBeEnabled();
  await expect(page.getByText(/Application error|Unhandled Runtime/i)).toHaveCount(0);
});

test("@a11y admin login ekrani accessibility smoke temiz", async ({ page }) => {
  await page.goto("/admin/login");
  await expectNoCriticalA11yViolations(page);
});
