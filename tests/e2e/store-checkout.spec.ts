import { createHmac } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import { expect, type Page, test } from "@playwright/test";
import postgres from "postgres";

import { expectNoCriticalA11yViolations } from "./support/a11y";

loadEnvConfig(process.cwd());

type CallbackTestEnv = {
  databaseUrl: string;
  merchantKey: string;
  merchantSalt: string;
};

let callbackTestSql: ReturnType<typeof postgres> | undefined;

function getCallbackTestEnv(): CallbackTestEnv | null {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const merchantKey = process.env.PAYTR_MERCHANT_KEY?.trim();
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT?.trim();

  if (!databaseUrl || !merchantKey || !merchantSalt) {
    return null;
  }

  const isLocalDb = /^postgres(?:ql)?:\/\/.*(?:localhost|127\.0\.0\.1)/i.test(databaseUrl);
  const explicitlyEnabled = process.env.PAYTR_CALLBACK_DB_TEST?.trim() === "1";

  if (!isLocalDb && !explicitlyEnabled) {
    return null;
  }

  return { databaseUrl, merchantKey, merchantSalt };
}

function getCallbackTestSql(env: CallbackTestEnv) {
  callbackTestSql ??= postgres(env.databaseUrl, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 1,
    prepare: false
  });

  return callbackTestSql;
}

function createPaytrCallbackHash({
  merchantKey,
  merchantOid,
  merchantSalt,
  status,
  totalAmount
}: {
  merchantKey: string;
  merchantOid: string;
  merchantSalt: string;
  status: "success" | "failed";
  totalAmount: string;
}) {
  return createHmac("sha256", merchantKey)
    .update(merchantOid + merchantSalt + status + totalAmount)
    .digest("base64");
}

async function createPaytrCallbackFixture({
  env,
  merchantOid,
  orderStatus = "pending_payment",
  paymentStatus = "pending",
  totalKurus = 1498800,
  transactionStatus = "token_received"
}: {
  env: CallbackTestEnv;
  merchantOid: string;
  orderStatus?: "pending_payment" | "payment_failed";
  paymentStatus?: "pending" | "failed";
  totalKurus?: number;
  transactionStatus?: "token_received" | "callback_failed";
}) {
  const sql = getCallbackTestSql(env);
  const orderNumber = `PCEV-TST-${merchantOid.slice(-12)}`;
  const [order] = await sql<{ id: string }[]>`
    insert into orders (
      order_number,
      merchant_oid,
      status,
      currency,
      subtotal_kurus,
      shipping_kurus,
      tax_kurus,
      total_kurus,
      payment_status,
      customer_name,
      customer_email,
      customer_phone
    )
    values (
      ${orderNumber},
      ${merchantOid},
      ${orderStatus},
      'TRY',
      ${totalKurus},
      0,
      0,
      ${totalKurus},
      ${paymentStatus},
      'PayTR Callback Test',
      'paytr-callback@parkchargeev.test',
      '05555555555'
    )
    returning id
  `;

  await sql`
    insert into paytr_transactions (
      order_id,
      merchant_oid,
      payment_amount_kurus,
      total_amount_kurus,
      status
    )
    values (
      ${order.id},
      ${merchantOid},
      ${totalKurus},
      ${totalKurus},
      ${transactionStatus}
    )
  `;

  return {
    orderId: order.id,
    sql,
    totalKurus
  };
}

async function cleanupPaytrCallbackFixture({
  merchantOid,
  orderId,
  sql
}: {
  merchantOid: string;
  orderId?: string;
  sql: ReturnType<typeof postgres>;
}) {
  if (orderId) {
    await sql`delete from order_status_history where order_id = ${orderId}`;
  }

  await sql`delete from paytr_transactions where merchant_oid = ${merchantOid}`;

  if (orderId) {
    await sql`delete from orders where id = ${orderId}`;
  }
}

test.afterAll(async () => {
  await callbackTestSql?.end({ timeout: 5 });
});

async function fillCheckoutContact(page: Page) {
  await page.locator('input[autocomplete="name"]').fill("ParkChargeEV Test");
  await page.locator('input[autocomplete="email"]').fill("qa@parkchargeev.com");
  await page.locator('input[autocomplete="tel"]').fill("05555555555");
  await page.locator('input[autocomplete="address-level1"]').fill("Istanbul");
  await page.locator('textarea[autocomplete="street-address"]').fill("Test Mahallesi, Test Sokak No: 1");
}

async function mockPaytrIframeFlow(page: Page) {
  let tokenRequestBody = "";

  await page.route("**/api/checkout/create", async (route) => {
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
      body: "<html><body><h1>Güvenli ödeme mock</h1></body></html>"
    });
  });

  return {
    getTokenRequestBody: () => tokenRequestBody
  };
}

async function mockPaytrLinkFlow(page: Page) {
  await page.route("**/api/checkout/create", async (route) => {
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
}

test("@e2e magaza -> urun -> sepet -> checkout akisi iframe mock ile tamamlanir", async ({
  page
}) => {
  test.setTimeout(75_000);
  const paytrMock = await mockPaytrIframeFlow(page);

  await page.goto("/urun/homecharge-pro-11kw", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { level: 1, name: "HomeCharge Pro 11kW" })
  ).toBeVisible();
  const addToCartButton = page.getByRole("button", { name: /Sepete Ekle/i }).first();
  await expect(addToCartButton).toBeEnabled();
  await addToCartButton.click();
  await expect(page.getByText(/sepete eklendi/i)).toBeVisible();

  await page.goto("/sepet", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="/checkout"]').first()).toBeVisible();
  await page.goto("/checkout", { waitUntil: "domcontentloaded" });

  await expect(page.locator('input[autocomplete="name"]')).toBeVisible();
  await fillCheckoutContact(page);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Öde ve Siparişi Tamamla/i }).click();

  await expect.poll(() => paytrMock.getTokenRequestBody()).toContain("productId");
  expect(paytrMock.getTokenRequestBody()).not.toContain("paymentAmountKurus");
  expect(paytrMock.getTokenRequestBody()).not.toContain("unitPrice");
  expect(paytrMock.getTokenRequestBody()).not.toContain("card_number");
  expect(paytrMock.getTokenRequestBody()).not.toContain("cvv");
  expect(paytrMock.getTokenRequestBody()).not.toContain("cc_owner");
  expect(paytrMock.getTokenRequestBody()).not.toContain("non_3d");
  expect(paytrMock.getTokenRequestBody()).not.toContain("non3d");
  expect(paytrMock.getTokenRequestBody()).not.toContain("payment_type");
  expect(paytrMock.getTokenRequestBody()).not.toContain("installment_count");
  expect(paytrMock.getTokenRequestBody()).not.toContain("card_type");
  await expect(page.locator('iframe[title="Güvenli kart ödeme formu"]')).toHaveAttribute(
    "src",
    "https://www.paytr.com/odeme/guvenli/mock_iframe_token"
  );
});

test("@e2e hosted link cevabi checkout sayfasindan cikmadan hata gosterir", async ({
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
  await page.goto("/checkout", { waitUntil: "domcontentloaded" });
  await fillCheckoutContact(page);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Öde ve Siparişi Tamamla/i }).click();

  await expect(
    page.getByText("Güvenli ödeme oturumu hazırlanamadı.")
  ).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
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
  await page.goto("/checkout", { waitUntil: "domcontentloaded" });

  await fillCheckoutContact(page);
  await page.getByRole("checkbox").check();

  await expect(page.getByRole("button", { name: /Öde ve Siparişi Tamamla/i })).toBeEnabled();
  await expect(page.locator('input[autocomplete^="cc"]')).toHaveCount(0);
  await page.getByRole("button", { name: /Öde ve Siparişi Tamamla/i }).click();

  await expect.poll(() => paytrMock.getTokenRequestBody()).toContain("productId");
  const paytrIframe = page.locator("iframe#paytriframe");
  await expect(paytrIframe).toBeVisible();
  await expect(paytrIframe).toHaveAttribute(
    "src",
    "https://www.paytr.com/odeme/guvenli/mock_iframe_token"
  );
  await expect(paytrIframe).not.toHaveAttribute("sandbox", /.+/);
  await expect(
    page.locator('script[src="https://www.paytr.com/js/iframeResizer.min.js?v2"]')
  ).toHaveCount(1);
  await expect(
    page.locator('script[src="https://www.paytr.com/js/iframeResizer.min.js"]')
  ).toHaveCount(0);
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

test("@e2e checkout CSP PayTR 3D Secure iframe kaynaklarini kapsar", async ({
  request
}) => {
  const response = await request.get("/checkout");
  const csp = response.headers()["content-security-policy"] ?? "";
  const xFrameOptions = response.headers()["x-frame-options"] ?? "";

  expect(csp).toContain("frame-src");
  expect(csp).toContain("child-src");
  expect(csp).toContain("frame-ancestors 'self' https://www.paytr.com https://*.paytr.com");
  expect(csp).not.toContain("frame-ancestors 'none'");
  expect(csp).toContain("frame-src 'self' https:");
  expect(csp).toContain("child-src 'self' https:");
  expect(csp).toContain("https://www.paytr.com");
  expect(csp).toContain("form-action 'self' https:");
  expect(xFrameOptions).toBe("");
});

test("@e2e genel site PayTR harici frame edilmeye kapali kalir", async ({
  request
}) => {
  const response = await request.get("/");
  const csp = response.headers()["content-security-policy"] ?? "";

  expect(csp).toContain("frame-ancestors 'none'");
});

test("@e2e PayTR donus endpointi hafif ve iframe uyumludur", async ({
  request
}) => {
  const response = await request.get("/api/paytr/return?status=success&oid=PCEVRETURNTEST");
  const csp = response.headers()["content-security-policy"] ?? "";
  const xFrameOptions = response.headers()["x-frame-options"] ?? "";
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(csp).toContain("frame-ancestors 'self' https://www.paytr.com https://*.paytr.com");
  expect(csp).not.toContain("frame-ancestors 'none'");
  expect(xFrameOptions).toBe("");
  expect(body).toContain("parkchargeev-paytr-return");
  expect(body).toContain("postMessage");
  expect(body).toContain("window.top.location.replace");
  expect(body).not.toContain("/_next/");
});

test("@e2e eski checkout istemcisi create endpointinde acik yenileme mesaji alir", async ({
  request
}) => {
  const response = await request.post("/api/checkout/create", {
    data: {}
  });
  const body = (await response.json()) as {
    ok: boolean;
    code: string;
    message: string;
  };

  expect(response.status()).toBe(409);
  expect(body.ok).toBe(false);
  expect(body.code).toBe("checkout_client_outdated");
  expect(body.message).toContain("Ctrl+F5");
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

test("@e2e PayTR success callback siparisi onaylar ve tekrarinda OK kalir", async ({
  request
}) => {
  test.skip(test.info().project.name !== "chromium", "DB callback smoke tek projede kosar.");
  const env = getCallbackTestEnv();
  test.skip(
    !env,
    "DATABASE_URL ve PayTR env yoksa ya da uzak DB icin PAYTR_CALLBACK_DB_TEST=1 degilse DB smoke atlanir."
  );

  const merchantOid = `PCEVSUCCESS${Date.now()}${Math.random().toString(16).slice(2, 8)}`;
  let orderId: string | undefined;
  const activeEnv = env as CallbackTestEnv;
  const { sql, totalKurus, orderId: createdOrderId } = await createPaytrCallbackFixture({
    env: activeEnv,
    merchantOid
  });
  orderId = createdOrderId;

  try {
    const totalAmount = String(totalKurus);
    const hash = createPaytrCallbackHash({
      merchantKey: activeEnv.merchantKey,
      merchantOid,
      merchantSalt: activeEnv.merchantSalt,
      status: "success",
      totalAmount
    });

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await request.post("/api/paytr/callback", {
        form: {
          merchant_oid: merchantOid,
          status: "success",
          total_amount: totalAmount,
          payment_amount: totalAmount,
          currency: "TL",
          hash
        }
      });

      expect(response.status()).toBe(200);
      expect(await response.text()).toBe("OK");
    }

    const [order] = await sql<{ status: string; payment_status: string }[]>`
      select status, payment_status from orders where merchant_oid = ${merchantOid}
    `;
    const [transaction] = await sql<{ status: string }[]>`
      select status from paytr_transactions where merchant_oid = ${merchantOid}
    `;

    expect(order.status).toBe("confirmed");
    expect(order.payment_status).toBe("paid");
    expect(transaction.status).toBe("callback_success");
  } finally {
    await cleanupPaytrCallbackFixture({ merchantOid, orderId, sql });
  }
});

test("@e2e PayTR failed callback siparisi basarisiz yapar ve nedeni kaydeder", async ({
  request
}) => {
  test.skip(test.info().project.name !== "chromium", "DB callback smoke tek projede kosar.");
  const env = getCallbackTestEnv();
  test.skip(
    !env,
    "DATABASE_URL ve PayTR env yoksa ya da uzak DB icin PAYTR_CALLBACK_DB_TEST=1 degilse DB smoke atlanir."
  );

  const merchantOid = `PCEVFAILED${Date.now()}${Math.random().toString(16).slice(2, 8)}`;
  let orderId: string | undefined;
  const activeEnv = env as CallbackTestEnv;
  const { sql, totalKurus, orderId: createdOrderId } = await createPaytrCallbackFixture({
    env: activeEnv,
    merchantOid
  });
  orderId = createdOrderId;

  try {
    const totalAmount = String(totalKurus);
    const hash = createPaytrCallbackHash({
      merchantKey: activeEnv.merchantKey,
      merchantOid,
      merchantSalt: activeEnv.merchantSalt,
      status: "failed",
      totalAmount
    });

    const response = await request.post("/api/paytr/callback", {
      form: {
        merchant_oid: merchantOid,
        status: "failed",
        total_amount: totalAmount,
        payment_amount: totalAmount,
        currency: "TL",
        failed_reason_code: "3DSECUREFAIL",
        failed_reason_msg: "3D secure dogrulamasi basarisiz oldu.",
        hash
      }
    });

    expect(response.status()).toBe(200);
    expect(await response.text()).toBe("OK");

    const [order] = await sql<{
      payment_status: string;
      status: string;
      status_note: string | null;
    }[]>`
      select status, payment_status, status_note from orders where merchant_oid = ${merchantOid}
    `;
    const [transaction] = await sql<{
      failed_reason_code: string | null;
      failed_reason_msg: string | null;
      status: string;
    }[]>`
      select status, failed_reason_code, failed_reason_msg
      from paytr_transactions
      where merchant_oid = ${merchantOid}
    `;

    expect(order.status).toBe("payment_failed");
    expect(order.payment_status).toBe("failed");
    expect(order.status_note).toContain("3DSECUREFAIL");
    expect(transaction.status).toBe("callback_failed");
    expect(transaction.failed_reason_code).toBe("3DSECUREFAIL");
    expect(transaction.failed_reason_msg).toBe("3D secure dogrulamasi basarisiz oldu.");
  } finally {
    await cleanupPaytrCallbackFixture({ merchantOid, orderId, sql });
  }
});

test("@e2e PayTR failed callback fail-return fallback sonrasi nedeni gunceller", async ({
  request
}) => {
  test.skip(test.info().project.name !== "chromium", "DB callback smoke tek projede kosar.");
  const env = getCallbackTestEnv();
  test.skip(
    !env,
    "DATABASE_URL ve PayTR env yoksa ya da uzak DB icin PAYTR_CALLBACK_DB_TEST=1 degilse DB smoke atlanir."
  );

  const merchantOid = `PCEVFALLBACK${Date.now()}${Math.random().toString(16).slice(2, 8)}`;
  let orderId: string | undefined;
  const activeEnv = env as CallbackTestEnv;
  const { sql, totalKurus, orderId: createdOrderId } = await createPaytrCallbackFixture({
    env: activeEnv,
    merchantOid,
    orderStatus: "payment_failed",
    paymentStatus: "failed",
    transactionStatus: "callback_failed"
  });
  orderId = createdOrderId;

  try {
    const totalAmount = String(totalKurus);
    const hash = createPaytrCallbackHash({
      merchantKey: activeEnv.merchantKey,
      merchantOid,
      merchantSalt: activeEnv.merchantSalt,
      status: "failed",
      totalAmount
    });

    const response = await request.post("/api/paytr/callback", {
      form: {
        merchant_oid: merchantOid,
        status: "failed",
        total_amount: totalAmount,
        payment_amount: totalAmount,
        currency: "TL",
        failed_reason_code: "BANK3DREJECT",
        failed_reason_msg: "Banka 3D secure yanitini reddetti.",
        hash
      }
    });

    expect(response.status()).toBe(200);
    expect(await response.text()).toBe("OK");

    const [transaction] = await sql<{
      failed_reason_code: string | null;
      failed_reason_msg: string | null;
      status: string;
    }[]>`
      select status, failed_reason_code, failed_reason_msg
      from paytr_transactions
      where merchant_oid = ${merchantOid}
    `;

    expect(transaction.status).toBe("callback_failed");
    expect(transaction.failed_reason_code).toBe("BANK3DREJECT");
    expect(transaction.failed_reason_msg).toBe("Banka 3D secure yanitini reddetti.");
  } finally {
    await cleanupPaytrCallbackFixture({ merchantOid, orderId, sql });
  }
});

test("@e2e bos cevapta teknik JSON hatasi yerine Turkce mesaj gosterir", async ({ page }) => {
  await page.route("**/api/checkout/create", async (route) => {
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

  await page.goto("/checkout", { waitUntil: "domcontentloaded" });

  await fillCheckoutContact(page);
  await page.getByRole("checkbox").check();

  await page.getByRole("button", { name: /Öde ve Siparişi Tamamla/i }).click();

  await expect(
    page.getByText("Güvenli ödeme oturumu hazırlanamadı. Lütfen tekrar deneyin.")
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

  await page.goto("/checkout", { waitUntil: "domcontentloaded" });

  const paymentButton = page.getByRole("button", {
    name: /Öde ve Siparişi Tamamla/i
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
  await page.goto("/checkout", { waitUntil: "domcontentloaded" });
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
  await expect(page.locator('iframe[title="Güvenli kart ödeme formu"]')).toBeVisible();
});

test("@a11y kritik magaza ve odeme ekranlarinda accessibility smoke temiz", async ({ page }) => {
  await page.goto("/magaza");
  await expectNoCriticalA11yViolations(page);

  await page.goto("/sepet");
  await expectNoCriticalA11yViolations(page);
});
