import { expect, test } from "@playwright/test";

test.describe("@e2e iletişim ve mobil navigasyon", () => {
  test("İletişim bilgilerini ve haritayı görüntüle", async ({ page }) => {
    await page.goto("/iletisim");

    await expect(page.getByText("05514914320").first()).toBeVisible();
    await expect(page.getByText("info@parkchargeev.com").first()).toBeVisible();
    await expect(page.getByText(/Esentepe Mah/i).first()).toBeVisible();
    await expect(page.locator('iframe[title*="haritası"], iframe[src*="maps"]').first()).toBeVisible();
  });

  test("Mobil menüden site bölümlerini aç", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: /Menüyü aç|Menüyü kapat/i });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await menuButton.click();

    const mobileMenu = page.locator("#site-mobile-menu");
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(mobileMenu).toBeVisible();

    await mobileMenu.getByRole("link", { name: /Mağaza/i }).click();
    await expect(page).toHaveURL(/\/magaza/);
  });
});
