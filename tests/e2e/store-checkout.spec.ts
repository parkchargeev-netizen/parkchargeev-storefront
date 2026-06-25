import { expect, type Page, test } from "@playwright/test";

import { expectNoCriticalA11yViolations } from "./support/a11y";

async function fillCheckoutContact(page: Page) {
  await page.locator('input[autocomplete="name"]').fill("ParkChargeEV Test");
  await page.locator('input[autocomplete="email"]').fill("qa@parkchargeev.com");
  await page.locator('input[autocomplete="tel"]').fill("05555555555");
  await page.locator('input[autocomplete="address-level1"]').fill("Istanbul");
  await page.locator('textarea[autocomplete="street-address"]').fill("Test Mahallesi, Test Sokak No: 1");
}

async function mockPaytrIframeFlow(page: Page) {
  let tokenRequestBody = "";

  await page.route("**/api/paytr/token", async (route) => {
    tokenRequestBody = route.request().postData() ?? "";

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        merchantOid: "PCEV-E2E-ORDER",
        iframeToken: "mock_iframe_token"
      })
    });
  });

  await page.route("https://www.paytr.com/odeme/guvenli/mock_iframe_token", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body><h1>PayTR güvenli ödeme mock</h1></body></html>"
    });
  });

  return {
    getTokenRequestBody: () => tokenRequestBody
  };
}

async function mockPaytrLinkFlow(page: Page) {
  await page.route("**/api/paytr/token", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        paymentFlow: "link",
        paymentUrl: "https://www.paytr.com/link/PCEVE2E",
        merchantOid: "PCEV-E2E-LINK-ORDER"
      })
    });
  });

  await page.route("https://www.paytr.com/link/PCEVE2E", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body><h1>PayTR Link API secure payment</h1></body></html>"
    });
  });
}

test("@e2e magaza -> urun -> sepet -> odeme akisi PayTR iframe mock ile tamamlanir", async ({
  page
}) => {
  test.setTimeout(75_000);
  const paytrMock = await mockPaytrIframeFlow(page);

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
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /PayTR ödeme ekranını aç/i }).click();

  await expect.poll(() => paytrMock.getTokenRequestBody()).toContain("productId");
  expect(paytrMock.getTokenRequestBody()).not.toContain("paymentAmountKurus");
  expect(paytrMock.getTokenRequestBody()).not.toContain("unitPrice");
  expect(paytrMock.getTokenRequestBody()).not.toContain("card_number");
  expect(paytrMock.getTokenRequestBody()).not.toContain("cvv");
  expect(paytrMock.getTokenRequestBody()).not.toContain("cc_owner");
  await expect(page.locator('iframe[title="PayTR ödeme formu"]')).toHaveAttribute(
    "src",
    "https://www.paytr.com/odeme/guvenli/mock_iframe_token"
  );
});

test("@e2e Basic API hesabinda PayTR Link odeme sayfasina yonlendirilir", async ({
  page
}) => {
  await mockPaytrLinkFlow(page);
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
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /PayTR ödeme ekranını aç/i }).click();

  await expect(page).toHaveURL("https://www.paytr.com/link/PCEVE2E");
  await expect(
    page.getByRole("heading", { name: "PayTR Link API secure payment" })
  ).toBeVisible();
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

test("@e2e kart alanlari yalnizca PayTR iframe icinde acilir", async ({
  page
}) => {
  const paytrMock = await mockPaytrIframeFlow(page);

  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });
  const addToCartButton = page.getByRole("button", { name: /Sepete Ekle/i }).first();
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();
  await expect(page.getByText(/sepete eklendi/i)).toBeVisible();
  await page.goto("/odeme", { waitUntil: "domcontentloaded" });

  await fillCheckoutContact(page);
  await page.getByRole("checkbox").check();

  await expect(page.getByRole("button", { name: /PayTR ödeme ekranını aç/i })).toBeEnabled();
  await expect(page.locator('input[autocomplete^="cc"]')).toHaveCount(0);
  await page.getByRole("button", { name: /PayTR ödeme ekranını aç/i }).click();

  await expect.poll(() => paytrMock.getTokenRequestBody()).toContain("productId");
  await expect(page.locator('iframe[title="PayTR ödeme formu"]')).toBeVisible();
});

test("@e2e legacy PayTR Direct API varsayilan olarak kapalidir", async ({
  request
}) => {
  const response = await request.post("/api/paytr/direct-form", {
    data: {}
  });
  const body = (await response.json()) as { ok: boolean; message: string };

  expect(response.status()).toBe(410);
  expect(body.ok).toBe(false);
  expect(body.message).toContain("iFrame");
});

test("@e2e PayTR Link callback gecersiz hash ile reddedilir", async ({
  request
}) => {
  const response = await request.post("/api/paytr/callback", {
    form: {
      callback_id: "PCEVINVALIDLINKCALLBACK",
      merchant_oid: "PROVIDERORDER",
      status: "success",
      total_amount: "1498800",
      payment_amount: "1498800",
      currency: "TL",
      hash: "invalid"
    }
  });

  expect(response.status()).toBe(400);
  expect(await response.text()).toContain("bad hash");
});

test("@e2e PayTR bos cevapta teknik JSON hatasi yerine Turkce mesaj gosterir", async ({ page }) => {
  await page.route("**/api/paytr/token", async (route) => {
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
  await page.getByRole("checkbox").check();

  await page.getByRole("button", { name: /PayTR ödeme ekranını aç/i }).click();

  await expect(
    page.getByText("PayTR güvenli ödeme ekranı hazırlanamadı. Lütfen tekrar deneyin.")
  ).toBeVisible();
  await expect(page.getByText(/Unexpected end of JSON input/i)).toHaveCount(0);
});

test("@e2e odeme butonu eksik bilgi varken aktif kalir ve hatayi aciklar", async ({
  page
}) => {
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

  const paymentButton = page.getByRole("button", {
    name: /PayTR ödeme ekranını aç/i
  });
  await expect(paymentButton).toBeEnabled();
  await paymentButton.click();
  await expect(
    page.getByText("Ad soyad bilgisini en az 2 karakter olacak şekilde girin.")
  ).toBeVisible();
});

test("@e2e tarayici otomatik doldurmasi React state olmasa da token istegine yansir", async ({
  page
}) => {
  const paytrMock = await mockPaytrIframeFlow(page);

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
  await page.getByRole("checkbox").check();

  await page.evaluate(() => {
    const values: Record<string, string> = {
      fullName: "Otomatik Dolum Test",
      email: "autofill@parkchargeev.com",
      phone: "05555555555",
      city: "Sakarya",
      address: "Esentepe Mahallesi test adresi"
    };

    for (const [name, value] of Object.entries(values)) {
      const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        `[name="${name}"]`
      );
      if (input) input.value = value;
    }

    document.querySelector<HTMLFormElement>("form")?.requestSubmit();
  });

  await expect.poll(() => paytrMock.getTokenRequestBody()).toContain(
    '"email":"autofill@parkchargeev.com"'
  );
  await expect(page.locator('iframe[title="PayTR ödeme formu"]')).toBeVisible();
});

test("@a11y kritik magaza ve odeme ekranlarinda accessibility smoke temiz", async ({ page }) => {
  await page.goto("/magaza");
  await expectNoCriticalA11yViolations(page);

  await page.goto("/sepet");
  await expectNoCriticalA11yViolations(page);
});
