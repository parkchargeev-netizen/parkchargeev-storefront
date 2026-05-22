import { expect, test } from "@playwright/test";

const compareStorageKey = "parkchargeev-compare-selection-v1";
const cartStorageKey = "parkchargeev-cart-v1";

test.beforeEach(async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ compareKey, cartKey }) => {
      window.localStorage.removeItem(compareKey);
      window.localStorage.removeItem(cartKey);
    },
    {
      compareKey: compareStorageKey,
      cartKey: cartStorageKey
    }
  );
});

test("@e2e Return from comparison to shopping", async ({ page }) => {
  await page.goto("/magaza", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Seçili")).toHaveCount(0);

  await page.goto("/karsilastir", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Karşılaştırmak için ürün seçin")).toBeVisible();

  await page.getByRole("button", { name: /HomeCharge Pro 11kW/i }).click();
  await expect(page.getByRole("button", { name: /HomeCharge Pro 11kW/i })).toContainText(
    "Seçili"
  );

  await page.goBack({ waitUntil: "domcontentloaded" });
  await expect(page.getByText("Seçili").first()).toBeVisible();
  await expect(page.locator("article", { hasText: "HomeCharge Pro 11kW" })).toContainText(
    "Seçili"
  );
});

test("@e2e Reject invalid login credentials", async ({ page }) => {
  await page.goto("/giris", { waitUntil: "domcontentloaded" });

  await page.locator('input[name="email"]').fill(`invalid-${Date.now()}@parkchargeev.test`);
  await page.locator('input[name="password"]').fill("WrongPass2026");
  await page.getByRole("button", { name: /Paneline Gir/i }).click();

  await expect(page.getByText(/E-posta veya/i)).toBeVisible();
  await expect(page).toHaveURL(/\/giris/);
});

test("@e2e Authentication: Show an error for invalid login credentials", async ({
  page,
  context
}) => {
  await page.goto("/giris", { waitUntil: "domcontentloaded" });
  await context.addCookies([
    {
      name: "parkchargeev_customer_session",
      value: "stale-session",
      url: page.url()
    }
  ]);
  await page.reload({ waitUntil: "domcontentloaded" });

  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/customer/auth/login") &&
      response.request().method() === "POST"
  );

  await page.locator('input[name="email"]').fill(`invalid-${Date.now()}@parkchargeev.test`);
  await page.locator('input[name="password"]').fill("WrongPass2026");
  await page.getByRole("button", { name: /Paneline Gir/i }).click();

  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status()).toBe(401);
  await expect(page.getByText(/E-posta veya/i)).toBeVisible();
  await expect(page).toHaveURL(/\/giris/);
  await expect.poll(async () => {
    const cookies = await context.cookies();
    return cookies.some((cookie) => cookie.name === "parkchargeev_customer_session");
  }).toBe(false);
});

test("@e2e Blog: Search the blog for EV content", async ({ page }) => {
  await page.goto("/arama?q=ev%20tipi%20%C5%9Farj", { waitUntil: "domcontentloaded" });

  await expect(
    page.locator('a[href="/blog/evde-elektrikli-arac-sarj-istasyonu-kurulumu"]').first()
  ).toBeVisible();
});

test("@e2e Handle an empty comparison state", async ({ page }) => {
  await page.goto("/karsilastir", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("Karşılaştırmak için ürün seçin")).toBeVisible();
  await expect(page.locator("table")).toHaveCount(0);
  await expect(page.getByText("Seçili")).toHaveCount(0);
});

test("@e2e Review the cart before checkout", async ({ page }) => {
  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Sepete Ekle/i }).click();
  await expect(page.getByText(/sepete eklendi/i)).toBeVisible();

  await page.goto("/sepet", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("HomeCharge Pro 11kW").first()).toBeVisible();
  await expect(page.getByText("Sipariş Özeti")).toBeVisible();
  await expect(page.locator('a[href="/odeme"]').first()).toBeVisible();
});
