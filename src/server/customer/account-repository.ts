import { and, desc, eq, inArray, or } from "drizzle-orm";
import { z } from "zod";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { getDb } from "@/server/db/client";
import {
  customerAddresses,
  customers,
  orderItems,
  orders,
  quoteRequests,
  serviceLeads
} from "@/server/db/schema";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { getCustomerSessionFromCookies } from "@/server/customer/auth";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || null);

export const customerProfileUpdateSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(10).max(32),
  marketingConsent: z.boolean().default(false)
});

export const customerAddressSchema = z.object({
  label: z.string().trim().min(2).max(80),
  fullName: optionalText(140),
  city: z.string().trim().min(2).max(80),
  district: z.string().trim().min(2).max(80),
  line1: z.string().trim().min(5).max(255),
  line2: optionalText(255),
  postalCode: optionalText(20),
  isDefault: z.boolean().default(false)
});

export const customerPasswordChangeSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z
    .string()
    .min(10)
    .max(128)
    .regex(/[A-Za-z]/, "Şifre en az bir harf içermeli.")
    .regex(/[0-9]/, "Şifre en az bir rakam içermeli.")
});

async function getAuthenticatedCustomerContext() {
  const session = await getCustomerSessionFromCookies();

  if (!session || !hasDatabaseConfig()) {
    return null;
  }

  const db = getDb();
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, session.sub))
    .limit(1);

  if (!customer) {
    return null;
  }

  return {
    db,
    session,
    customer
  };
}

export async function getCustomerAccountSnapshot() {
  const context = await getAuthenticatedCustomerContext();

  if (!context) {
    return null;
  }

  const { db, session, customer } = context;
  const quoteFilter = customer.phone
    ? or(eq(quoteRequests.email, customer.email), eq(quoteRequests.phone, customer.phone))
    : eq(quoteRequests.email, customer.email);
  const serviceFilter = customer.phone
    ? or(eq(serviceLeads.email, customer.email), eq(serviceLeads.phone, customer.phone))
    : eq(serviceLeads.email, customer.email);

  const [addresses, recentOrders, recentQuoteRequests, recentServiceLeads] =
    await Promise.all([
      db
        .select()
        .from(customerAddresses)
        .where(eq(customerAddresses.customerId, customer.id))
        .orderBy(desc(customerAddresses.isDefault))
        .limit(8),
      db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          totalKurus: orders.totalKurus,
          shippingCarrier: orders.shippingCarrier,
          trackingNumber: orders.trackingNumber,
          trackingUrl: orders.trackingUrl,
          statusNote: orders.statusNote,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt
        })
        .from(orders)
        .where(eq(orders.customerId, customer.id))
        .orderBy(desc(orders.createdAt))
        .limit(8),
      db
        .select({
          id: quoteRequests.id,
          segment: quoteRequests.segment,
          status: quoteRequests.status,
          city: quoteRequests.city,
          district: quoteRequests.district,
          requestNotes: quoteRequests.requestNotes,
          createdAt: quoteRequests.createdAt,
          updatedAt: quoteRequests.updatedAt
        })
        .from(quoteRequests)
        .where(quoteFilter)
        .orderBy(desc(quoteRequests.createdAt))
        .limit(5),
      db
        .select({
          id: serviceLeads.id,
          leadType: serviceLeads.leadType,
          status: serviceLeads.status,
          city: serviceLeads.city,
          district: serviceLeads.district,
          projectType: serviceLeads.projectType,
          createdAt: serviceLeads.createdAt
        })
        .from(serviceLeads)
        .where(serviceFilter)
        .orderBy(desc(serviceLeads.createdAt))
        .limit(5)
    ]);

  const orderIds = recentOrders.map((order) => order.id);
  const items = orderIds.length
    ? await db
        .select({
          orderId: orderItems.orderId,
          productName: orderItems.productName,
          variantName: orderItems.variantName,
          quantity: orderItems.quantity,
          lineTotalKurus: orderItems.lineTotalKurus
        })
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds))
        .limit(60)
    : [];

  const itemsByOrderId = new Map<string, typeof items>();
  for (const item of items) {
    const existingItems = itemsByOrderId.get(item.orderId) ?? [];
    existingItems.push(item);
    itemsByOrderId.set(item.orderId, existingItems);
  }

  return {
    session,
    customer,
    addresses,
    recentOrders: recentOrders.map((order) => ({
      ...order,
      items: itemsByOrderId.get(order.id) ?? []
    })),
    recentQuoteRequests,
    recentServiceLeads
  };
}

export async function updateCustomerProfile(
  input: z.infer<typeof customerProfileUpdateSchema>
) {
  const context = await getAuthenticatedCustomerContext();

  if (!context) {
    return null;
  }

  const [updatedCustomer] = await context.db
    .update(customers)
    .set({
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      marketingConsent: input.marketingConsent
    })
    .where(eq(customers.id, context.customer.id))
    .returning();

  return updatedCustomer ?? context.customer;
}

export async function addCustomerAddress(
  input: z.infer<typeof customerAddressSchema>
) {
  const context = await getAuthenticatedCustomerContext();

  if (!context) {
    return null;
  }

  const [existingAddress] = await context.db
    .select({ id: customerAddresses.id })
    .from(customerAddresses)
    .where(eq(customerAddresses.customerId, context.customer.id))
    .limit(1);
  const shouldSetDefault = input.isDefault || !existingAddress;

  if (shouldSetDefault) {
    await context.db
      .update(customerAddresses)
      .set({ isDefault: false })
      .where(eq(customerAddresses.customerId, context.customer.id));
  }

  const [address] = await context.db
    .insert(customerAddresses)
    .values({
      customerId: context.customer.id,
      label: input.label,
      fullName: input.fullName,
      city: input.city,
      district: input.district,
      line1: input.line1,
      line2: input.line2,
      postalCode: input.postalCode,
      isDefault: shouldSetDefault
    })
    .returning();

  return address ?? null;
}

export async function deleteCustomerAddress(addressId: string) {
  const context = await getAuthenticatedCustomerContext();

  if (!context) {
    return null;
  }

  const [deletedAddress] = await context.db
    .delete(customerAddresses)
    .where(
      and(
        eq(customerAddresses.id, addressId),
        eq(customerAddresses.customerId, context.customer.id)
      )
    )
    .returning({ id: customerAddresses.id });

  return deletedAddress ?? false;
}

export async function changeCustomerPassword(
  input: z.infer<typeof customerPasswordChangeSchema>
) {
  const context = await getAuthenticatedCustomerContext();

  if (!context?.customer.passwordHash) {
    return null;
  }

  if (!verifyPassword(input.currentPassword, context.customer.passwordHash)) {
    return false;
  }

  await context.db
    .update(customers)
    .set({
      passwordHash: hashPassword(input.newPassword)
    })
    .where(eq(customers.id, context.customer.id));

  return true;
}
