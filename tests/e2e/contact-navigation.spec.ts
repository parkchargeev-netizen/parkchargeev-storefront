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

    const commonMenuToggle = page
      .locator(
        '#mobile-menu-toggle, [data-testid="mobile-menu-toggle"], [data-menu-toggle="site"], .menu-toggle, .hamburger-menu'
      )
      .first();
    await expect(commonMenuToggle).toBeVisible();

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

  test("Mobile pages do not overflow and homepage charging visual stays hidden", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of ["/", "/magaza", "/urun-secici", "/iletisim"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      const widths = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth
      }));

      expect(widths.content).toBeLessThanOrEqual(widths.viewport + 1);
    }

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".premium-hero__visual")).toBeHidden();
    await expect(page.locator(".coverage-route-card")).toHaveCount(3);
  });

  test("Contact form accepts requests from every province", async ({ page }) => {
    await page.route("**/api/lead", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          message: "Talebiniz alındı. Ekibimiz en kısa sürede dönüş yapacak."
        })
      });
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/iletisim", { waitUntil: "domcontentloaded" });
    await page.locator('input[name="fullName"]').fill("Test Kullanıcı");
    await page.locator('input[name="email"]').fill("test@example.com");
    await page.locator('input[name="phone"]').fill("05555555555");
    await page.locator('input[name="city"]').fill("İzmir");
    await page.locator('select[name="reason"]').selectOption({
      label: "Ücretsiz keşif talebi"
    });
    await page
      .locator('textarea[name="message"]')
      .fill("İzmir için şarj cihazı keşif talebi oluşturmak istiyorum.");
    await page.locator('input[name="privacyConsent"]').check();
    await page.getByRole("button", { name: "Talebi Gönder" }).click();

    await expect(page.getByRole("status")).toContainText("Talebiniz alındı");
    await expect(page.getByText(/yalnızca Sakarya|Sakarya ve Kocaeli/i)).toHaveCount(0);
  });
});
