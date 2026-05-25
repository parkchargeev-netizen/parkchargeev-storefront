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

  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1")).toBeVisible();
  const addToCartButton = page.getByRole("button", { name: /Sepete Ekle/i });
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();
  await expect(page.getByText(/sepete eklendi/i)).toBeVisible();

  await page.goto("/sepet", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="/odeme"]').first()).toBeVisible();
  await page.goto("/odeme", { waitUntil: "domcontentloaded" });

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

test("@e2e kablo uzunlugu fiyat ve sepet tutarini gunceller", async ({ page }) => {
  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });

  await expect(page.getByText(/12\.490/).first()).toBeVisible();
  const extendedCableButton = page.getByRole("button", { name: /7\.5 Metre/i });
  await extendedCableButton.click();
  await expect(extendedCableButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/13\.290/).first()).toBeVisible();

  await page.getByRole("button", { name: /Sepete Ekle/i }).click();
  await expect(page.getByText(/sepete eklendi/i)).toBeVisible();

  await page.goto("/sepet", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("7.5 Metre (+800 TL)")).toBeVisible();
  await expect(page.getByText(/13\.290/).first()).toBeVisible();
});

test("@e2e PayTR Direkt API 3D Secure formu PayTR'a post eder", async ({ page }) => {
  let directApiRequestBody = "";
  let paytrPostBody = "";

  await page.route("**/api/paytr/direct-form", async (route) => {
    directApiRequestBody = route.request().postData() ?? "";

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        merchantOid: "PCEV-DIRECT-E2E",
        formAction: "https://www.paytr.com/odeme",
        fields: {
          merchant_id: "123456",
          user_ip: "127.0.0.1",
          merchant_oid: "PCEV-DIRECT-E2E",
          email: "qa@parkchargeev.com",
          payment_type: "card",
          payment_amount: "100.00",
          currency: "TL",
          test_mode: "1",
          non_3d: "0",
          merchant_ok_url: "http://localhost:3000/odeme?status=success&oid=PCEV-DIRECT-E2E",
          merchant_fail_url: "http://localhost:3000/odeme?status=failed&oid=PCEV-DIRECT-E2E",
          user_name: "ParkChargeEV Test",
          user_address: "Test Mahallesi, Test Sokak No: 1, Istanbul",
          user_phone: "05555555555",
          user_basket: '[["HomeCharge Pro 11kW","100.00",1]]',
          debug_on: "1",
          client_lang: "tr",
          paytr_token: "mock_direct_token",
          non3d_test_failed: "0",
          installment_count: "0",
          card_type: ""
        }
      })
    });
  });

  await page.route("https://www.paytr.com/odeme", async (route) => {
    paytrPostBody = route.request().postData() ?? "";

    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html><body><h1>PayTR Direct Mock</h1></body></html>"
    });
  });

  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });
  const addToCartButton = page.getByRole("button", { name: /Sepete Ekle/i });
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();
  await expect(page.getByText(/sepete eklendi/i)).toBeVisible();
  await page.goto("/odeme", { waitUntil: "domcontentloaded" });

  await page.locator('input[autocomplete="name"]').fill("ParkChargeEV Test");
  await page.locator('input[autocomplete="email"]').fill("qa@parkchargeev.com");
  await page.locator('input[autocomplete="tel"]').fill("05555555555");
  await page.locator('input[autocomplete="address-level1"]').fill("Istanbul");
  await page.locator('textarea[autocomplete="street-address"]').fill("Test Mahallesi, Test Sokak No: 1");
  await page.locator("button").filter({ hasText: "Direkt API 3D Secure" }).click();
  await page.locator('input[autocomplete="cc-name"]').fill("Park Test");
  await page.locator('input[autocomplete="cc-number"]').fill("4355084355084358");
  await page.locator('input[autocomplete="cc-exp-month"]').fill("12");
  await page.locator('input[autocomplete="cc-exp-year"]').fill("28");
  await page.locator('input[autocomplete="cc-csc"]').fill("000");
  await page.getByRole("button", { name: /3D Secure ile Öde/i }).click();

  await expect(page.getByText("PayTR Direct Mock")).toBeVisible();

  expect(directApiRequestBody).not.toContain("4355084355084358");
  expect(directApiRequestBody).not.toContain("000");

  const paytrFields = new URLSearchParams(paytrPostBody);
  expect(paytrFields.get("merchant_oid")).toBe("PCEV-DIRECT-E2E");
  expect(paytrFields.get("paytr_token")).toBe("mock_direct_token");
  expect(paytrFields.get("cc_owner")).toBe("Park Test");
  expect(paytrFields.get("card_number")).toBe("4355084355084358");
  expect(paytrFields.get("expiry_month")).toBe("12");
  expect(paytrFields.get("expiry_year")).toBe("28");
  expect(paytrFields.get("cvv")).toBe("000");
});

test("@a11y kritik magaza ve odeme ekranlarinda accessibility smoke temiz", async ({ page }) => {
  await page.goto("/magaza");
  await expectNoCriticalA11yViolations(page);

  await page.goto("/sepet");
  await expectNoCriticalA11yViolations(page);
});
