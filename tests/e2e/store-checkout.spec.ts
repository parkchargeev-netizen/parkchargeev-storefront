import { expect, type Page, test } from "@playwright/test";

import { expectNoCriticalA11yViolations } from "./support/a11y";

const mockedPaytrFields = {
  merchant_id: "123456",
  user_ip: "127.0.0.1",
  merchant_oid: "PCEV-E2E-ORDER",
  email: "qa@parkchargeev.com",
  payment_type: "card",
  payment_amount: "124.90",
  currency: "TL",
  test_mode: "1",
  non_3d: "0",
  merchant_ok_url: "http://localhost:3100/odeme?status=success&oid=PCEV-E2E-ORDER",
  merchant_fail_url: "http://localhost:3100/odeme?status=failed&oid=PCEV-E2E-ORDER",
  user_name: "ParkChargeEV Test",
  user_address: "Test Mahallesi, Test Sokak No: 1, Istanbul",
  user_phone: "05555555555",
  user_basket: '[["HomeCharge Pro 11kW","124.90",1]]',
  debug_on: "1",
  client_lang: "tr",
  paytr_token: "signed_test_token",
  non3d_test_failed: "0",
  installment_count: "0",
  card_type: ""
};

async function fillCheckoutContact(page: Page) {
  await page.locator('input[autocomplete="name"]').fill("ParkChargeEV Test");
  await page.locator('input[autocomplete="email"]').fill("qa@parkchargeev.com");
  await page.locator('input[autocomplete="tel"]').fill("05555555555");
  await page.locator('input[autocomplete="address-level1"]').fill("Istanbul");
  await page.locator('textarea[autocomplete="street-address"]').fill("Test Mahallesi, Test Sokak No: 1");
}

async function fillPaytrCard(page: Page) {
  await page.locator('input[name="cc_owner"]').fill("PAYTR TEST");
  await page.locator('input[name="card_number"]').fill("9792030394440796");
  await page.locator('input[name="expiry_month"]').fill("12");
  await page.locator('input[name="expiry_year"]').fill("99");
  await page.locator('input[name="cvv"]').fill("000");
}

async function mockPaytrDirectFlow(page: Page) {
  let directFormRequestBody = "";
  let paytrFormBody = "";

  await page.route("**/api/paytr/direct-form", async (route) => {
    directFormRequestBody = route.request().postData() ?? "";

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        action: "https://www.paytr.com/odeme",
        merchantOid: "PCEV-E2E-ORDER",
        fields: mockedPaytrFields
      })
    });
  });

  await page.route("https://www.paytr.com/odeme", async (route) => {
    paytrFormBody = route.request().postData() ?? "";

    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>PayTR mock</body></html>"
    });
  });

  return {
    getDirectFormRequestBody: () => directFormRequestBody,
    getPaytrFormBody: () => paytrFormBody
  };
}

test("@e2e magaza -> urun -> sepet -> odeme akisi PayTR Direkt API mock ile tamamlanir", async ({
  page
}) => {
  const paytrMock = await mockPaytrDirectFlow(page);

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
  await fillCheckoutContact(page);
  await fillPaytrCard(page);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Kartı Doğrula ve Öde/i }).click();

  await expect.poll(() => paytrMock.getPaytrFormBody()).toContain("paytr_token=signed_test_token");
  expect(paytrMock.getDirectFormRequestBody()).toContain("productId");
  expect(paytrMock.getDirectFormRequestBody()).not.toContain("paymentAmountKurus");
  expect(paytrMock.getDirectFormRequestBody()).not.toContain("unitPrice");
  expect(paytrMock.getDirectFormRequestBody()).not.toContain("card_number");
  expect(paytrMock.getDirectFormRequestBody()).not.toContain("cvv");
  expect(paytrMock.getDirectFormRequestBody()).not.toContain("cc_owner");
  expect(paytrMock.getPaytrFormBody()).toContain("merchant_oid=PCEV-E2E-ORDER");
  expect(paytrMock.getPaytrFormBody()).toContain("card_number=9792030394440796");
  expect(paytrMock.getPaytrFormBody()).toContain("cvv=000");
});

test("@e2e kablo uzunlugu fiyat ve sepet tutarini gunceller", async ({ page }) => {
  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });

  const priceScope =
    (page.viewportSize()?.width ?? 0) <= 767
      ? page.locator(".product-mobile-inline-atc")
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

test("@e2e PayTR Direkt API kart formu gorunur ve kart verisi sunucuya gonderilmez", async ({
  page
}) => {
  const paytrMock = await mockPaytrDirectFlow(page);

  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });
  const addToCartButton = page.getByRole("button", { name: /Sepete Ekle/i }).first();
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();
  await expect(page.getByText(/sepete eklendi/i)).toBeVisible();
  await page.goto("/odeme", { waitUntil: "domcontentloaded" });

  await fillCheckoutContact(page);
  await fillPaytrCard(page);
  await page.getByRole("checkbox").check();

  await expect(page.getByRole("button", { name: /Kartı Doğrula ve Öde/i })).toBeVisible();
  await expect(page.locator('input[autocomplete^="cc"]')).toHaveCount(5);
  await page.getByRole("button", { name: /Kartı Doğrula ve Öde/i }).click();

  await expect.poll(() => paytrMock.getDirectFormRequestBody()).toContain("productId");
  expect(paytrMock.getDirectFormRequestBody()).not.toContain("9792030394440796");
  expect(paytrMock.getDirectFormRequestBody()).not.toContain("000");
  expect(paytrMock.getDirectFormRequestBody()).not.toContain("PAYTR TEST");
});

test("@e2e PayTR bos cevapta teknik JSON hatasi yerine Turkce mesaj gosterir", async ({ page }) => {
  await page.route("**/api/paytr/direct-form", async (route) => {
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

  await fillCheckoutContact(page);
  await fillPaytrCard(page);
  await page.getByRole("checkbox").check();

  await page.getByRole("button", { name: /Kartı Doğrula ve Öde/i }).click();

  await expect(
    page.getByText("PayTR ödeme formu hazırlanamadı. Lütfen tekrar deneyin.")
  ).toBeVisible();
  await expect(page.getByText(/Unexpected end of JSON input/i)).toHaveCount(0);
});

test("@a11y kritik magaza ve odeme ekranlarinda accessibility smoke temiz", async ({ page }) => {
  await page.goto("/magaza");
  await expectNoCriticalA11yViolations(page);

  await page.goto("/sepet");
  await expectNoCriticalA11yViolations(page);
});
