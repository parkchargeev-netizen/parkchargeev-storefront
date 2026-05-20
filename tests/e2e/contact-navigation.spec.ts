import { expect, test } from "@playwright/test";

test.describe("@e2e contact and mobile navigation", () => {
  test("View contact details and map", async ({ page }) => {
    const response = await page.goto("/iletisim");

    await expect(page.getByText("05514914320").first()).toBeVisible();
    await expect(page.getByText("info@parkchargeev.com").first()).toBeVisible();
    await expect(page.getByText(/Esentepe Mah/i).first()).toBeVisible();

    const mapFrame = page
      .locator('[data-testid="contact-map-iframe"], iframe[src*="google.com/maps/embed"]')
      .first();

    await expect(mapFrame).toBeVisible();
    await expect(mapFrame).toHaveAttribute("loading", "lazy");
    expect(response?.headers()["content-security-policy"]).toContain("https://www.google.com");
  });

  test("Open site sections from the mobile menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const menuButton = page.getByTestId("mobile-menu-toggle");
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton).toHaveAccessibleName(/open menu|menüyü aç/i);

    await menuButton.click();

    const mobileMenu = page.locator("#site-mobile-menu");
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(mobileMenu).toBeVisible();

    await mobileMenu.locator('a[href="/magaza"]').click();
    await expect(page).toHaveURL(/\/magaza/);
  });
});
