import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { CART_TAX_RATE } from "@/lib/cart-core";
import { generateMerchantOid } from "@/lib/paytr";
import type { PaytrCheckoutItem } from "@/lib/paytr";
import { getProductCableOptions } from "@/lib/product-options";
import { listPublicProducts } from "@/server/admin/repository";
import { getDb } from "@/server/db/client";
import { customers, orderItems, orders, paytrTransactions } from "@/server/db/schema";

export const paytrCheckoutRequestSchema = z.object({
  email: z.string().trim().email().max(100),
  userName: z.string().trim().min(2).max(60),
  userAddress: z.string().trim().min(5).max(400),
  userPhone: z.string().trim().min(10).max(20),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(160),
        cableOption: z.string().trim().min(1).max(180),
        quantity: z.number().int().positive().max(99)
      })
    )
    .min(1)
    .max(50)
});

export type PaytrCheckoutRequest = z.infer<typeof paytrCheckoutRequestSchema>;
export type PaytrCheckoutFlow = "iframe" | "direct_api";

type PricedCheckoutItem = {
  productId: string;
  productDbId: string | null;
  variantId: string | null;
  productName: string;
  variantName: string;
  sku: string | null;
  title: string;
  quantity: number;
  unitPriceKurus: number;
  lineTotalKurus: number;
};

export class PaytrCheckoutPriçingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaytrCheckoutPriçingError";
  }
}

export function isPaytrCheckoutPriçingError(
  error: unknown
): error is PaytrCheckoutPriçingError {
  return error instanceof PaytrCheckoutPriçingError;
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? fullName,
    lastName: parts.slice(1).join(" ") || null
  };
}

function createOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `PCEV-${stamp}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function getPaytrUserIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return (
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    process.env.PAYTR_TEST_USER_IP ||
    "127.0.0.1"
  );
}

function formatPaytrUnitPrice(unitPriceKurus: number) {
  return (unitPriceKurus / 100).toFixed(2);
}

function limitText(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function isUuid(value?: string | null) {
  return Boolean(
    value?.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  );
}

async function priceCheckoutItems(items: PaytrCheckoutRequest["items"]) {
  const publicProducts = await listPublicProducts();
  const pricedItems = items.map((item): PricedCheckoutItem => {
    const product = publicProducts.find((candidate) => candidate.id === item.productId);

    if (!product) {
      throw new PaytrCheckoutPriçingError(
        "Sepetteki bir ürün artık satış listesinde bulunamadı. Lütfen sepetinizi güncelleyin."
      );
    }

    if (product.stockLabel === "Stokta Yok") {
      throw new PaytrCheckoutPriçingError(
        `${product.name} ürünü şu anda stokta değil. Lütfen sepetinizi güncelleyin.`
      );
    }

    const selectedOption = getProductCableOptions(product).find(
      (option) => option.label === item.cableOption
    );

    if (!selectedOption) {
      throw new PaytrCheckoutPriçingError(
        `${product.name} için seçilen kablo varyantı artık kullanılamıyor. Lütfen sepetinizi güncelleyin.`
      );
    }

    const selectedVariant = product.variants?.find(
      (variant) => variant.cableLength === selectedOption.label
    );

    if (selectedVariant && selectedVariant.stockQuantity <= 0) {
      throw new PaytrCheckoutPriçingError(
        `${product.name} - ${selectedOption.label} varyantı stokta değil. Lütfen sepetinizi güncelleyin.`
      );
    }

    if (selectedOption.priceKurus <= 0) {
      throw new PaytrCheckoutPriçingError(
        `${product.name} için geçerli bir fiyat bulunamadı. Lütfen sepetinizi güncelleyin.`
      );
    }

    const lineTotalKurus = selectedOption.priceKurus * item.quantity;

    return {
      productId: product.id,
      productDbId: isUuid(product.id) ? product.id : null,
      variantId: isUuid(selectedVariant?.id) ? selectedVariant?.id ?? null : null,
      productName: product.name,
      variantName: selectedOption.label,
      sku: selectedVariant?.sku ?? null,
      title: limitText(`${product.name} - ${selectedOption.label}`, 180),
      quantity: item.quantity,
      unitPriceKurus: selectedOption.priceKurus,
      lineTotalKurus
    };
  });
  const subtotalKurus = pricedItems.reduce(
    (total, item) => total + item.lineTotalKurus,
    0
  );
  const taxKurus = Math.round(subtotalKurus * CART_TAX_RATE);
  const paymentAmountKurus = subtotalKurus + taxKurus;
  const paytrItems: PaytrCheckoutItem[] = pricedItems.map((item) => ({
    title: item.title,
    unitPrice: formatPaytrUnitPrice(item.unitPriceKurus),
    quantity: item.quantity
  }));

  return {
    pricedItems,
    subtotalKurus,
    taxKurus,
    paymentAmountKurus,
    paytrItems
  };
}

export async function createPaytrCheckoutOrder({
  body,
  flow,
  request
}: {
  body: PaytrCheckoutRequest;
  flow: PaytrCheckoutFlow;
  request: Request;
}) {
  const db = getDb();
  const userIp = getPaytrUserIp(request);
  const { firstName, lastName } = splitFullName(body.userName);
  const {
    pricedItems,
    subtotalKurus,
    taxKurus,
    paymentAmountKurus,
    paytrItems
  } = await priceCheckoutItems(body.items);
  const merchantOid = generateMerchantOid();

  const { order } = await db.transaction(async (tx) => {
    const [insertedCustomer] = await tx
      .insert(customers)
      .values({
        email: body.email,
        firstName,
        lastName,
        phone: body.userPhone,
        role: "guest"
      })
      .onConflictDoNothing({
        target: customers.email
      })
      .returning({
        id: customers.id
      });
    const customer =
      insertedCustomer ??
      (
        await tx
          .select({ id: customers.id })
          .from(customers)
          .where(eq(customers.email, body.email))
          .limit(1)
      )[0];

    if (!customer) {
      throw new Error("Müşteri kaydı oluşturulamadı.");
    }

    const [createdOrder] = await tx
      .insert(orders)
      .values({
        customerId: customer.id,
        orderNumber: createOrderNumber(),
        merchantOid,
        status: "pending_payment",
        currency: "TRY",
        subtotalKurus,
        shippingKurus: 0,
        taxKurus,
        totalKurus: paymentAmountKurus,
        paymentProvider: "paytr",
        paymentStatus: "pending",
        customerName: body.userName,
        customerEmail: body.email,
        customerPhone: body.userPhone
      })
      .returning({
        id: orders.id
    });

    await tx.insert(orderItems).values(
      pricedItems.map((item) => ({
        orderId: createdOrder.id,
        productId: item.productDbId,
        variantId: item.variantId,
        productName: limitText(item.productName, 180),
        variantName: limitText(item.variantName, 180),
        sku: item.sku ? limitText(item.sku, 120) : null,
        quantity: item.quantity,
        unitPriceKurus: item.unitPriceKurus,
        lineTotalKurus: item.lineTotalKurus
      }))
    );

    await tx.insert(paytrTransactions).values({
      orderId: createdOrder.id,
      merchantOid,
      paymentAmountKurus,
      rawRequest: {
        requestBody: {
          email: body.email,
          flow,
          itemCount: body.items.length,
          paymentAmountKurus,
          serverPriced: true
        }
      }
    });

    return {
      order: createdOrder
    };
  });

  return {
    db,
    order,
    merchantOid,
    userIp,
    paymentAmountKurus,
    items: paytrItems
  };
}
