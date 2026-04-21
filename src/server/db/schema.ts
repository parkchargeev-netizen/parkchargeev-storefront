import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived"
]);

export const customerRoleEnum = pgEnum("customer_role", [
  "guest",
  "customer",
  "admin"
]);

export const orderStatusEnum = pgEnum("order_status", [
  "draft",
  "pending_payment",
  "payment_processing",
  "paid",
  "failed",
  "cancelled",
  "fulfilled"
]);

export const paytrStatusEnum = pgEnum("paytr_status", [
  "created",
  "token_received",
  "callback_success",
  "callback_failed"
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost"
]);

export const brands = pgTable(
  "brands",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    websiteUrl: varchar("website_url", { length: 255 }),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    slugIndex: uniqueIndex("brands_slug_idx").on(table.slug)
  })
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: text("description"),
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    slugIndex: uniqueIndex("categories_slug_idx").on(table.slug)
  })
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    status: productStatusEnum("status").default("draft").notNull(),
    categoryId: uuid("category_id").references(() => categories.id),
    brandId: uuid("brand_id").references(() => brands.id),
    shortDescription: text("short_description").notNull(),
    description: text("description").notNull(),
    useCase: varchar("use_case", { length: 80 }),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    searchKeywords: jsonb("search_keywords").$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    slugIndex: uniqueIndex("products_slug_idx").on(table.slug),
    categoryIndex: index("products_category_idx").on(table.categoryId),
    brandIndex: index("products_brand_idx").on(table.brandId)
  })
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    sku: varchar("sku", { length: 120 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    powerLabel: varchar("power_label", { length: 80 }),
    cableLength: varchar("cable_length", { length: 80 }),
    connectorType: varchar("connector_type", { length: 80 }),
    stockQuantity: integer("stock_quantity").default(0).notNull(),
    priceKurus: integer("price_kurus").notNull(),
    compareAtKurus: integer("compare_at_kurus"),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    skuIndex: uniqueIndex("product_variants_sku_idx").on(table.sku),
    productIndex: index("product_variants_product_idx").on(table.productId)
  })
);

export const productMedia = pgTable(
  "product_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    variantId: uuid("variant_id").references(() => productVariants.id),
    mediaType: varchar("media_type", { length: 40 }).default("image").notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    altText: varchar("alt_text", { length: 255 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull()
  },
  (table) => ({
    productIndex: index("product_media_product_idx").on(table.productId)
  })
);

export const productSpecs = pgTable(
  "product_specs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    groupName: varchar("group_name", { length: 80 }).default("general").notNull(),
    label: varchar("label", { length: 120 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull()
  },
  (table) => ({
    productIndex: index("product_specs_product_idx").on(table.productId)
  })
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 180 }).notNull(),
    firstName: varchar("first_name", { length: 80 }),
    lastName: varchar("last_name", { length: 80 }),
    phone: varchar("phone", { length: 32 }),
    role: customerRoleEnum("role").default("customer").notNull(),
    passwordHash: varchar("password_hash", { length: 255 }),
    marketingConsent: boolean("marketing_consent").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    emailIndex: uniqueIndex("customers_email_idx").on(table.email)
  })
);

export const customerAddresses = pgTable(
  "customer_addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    label: varchar("label", { length: 80 }).notNull(),
    fullName: varchar("full_name", { length: 140 }),
    city: varchar("city", { length: 80 }).notNull(),
    district: varchar("district", { length: 80 }).notNull(),
    line1: varchar("line1", { length: 255 }).notNull(),
    line2: varchar("line2", { length: 255 }),
    postalCode: varchar("postal_code", { length: 20 }),
    isDefault: boolean("is_default").default(false).notNull()
  },
  (table) => ({
    customerIndex: index("customer_addresses_customer_idx").on(table.customerId)
  })
);

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customers.id),
    sessionId: varchar("session_id", { length: 120 }),
    currency: varchar("currency", { length: 12 }).default("TRY").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    sessionIndex: uniqueIndex("carts_session_idx").on(table.sessionId)
  })
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id),
    quantity: integer("quantity").default(1).notNull()
  },
  (table) => ({
    cartIndex: index("cart_items_cart_idx").on(table.cartId)
  })
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customers.id),
    orderNumber: varchar("order_number", { length: 64 }).notNull(),
    merchantOid: varchar("merchant_oid", { length: 80 }).notNull(),
    status: orderStatusEnum("status").default("draft").notNull(),
    currency: varchar("currency", { length: 12 }).default("TRY").notNull(),
    subtotalKurus: integer("subtotal_kurus").notNull(),
    shippingKurus: integer("shipping_kurus").default(0).notNull(),
    taxKurus: integer("tax_kurus").default(0).notNull(),
    totalKurus: integer("total_kurus").notNull(),
    paymentProvider: varchar("payment_provider", { length: 40 })
      .default("paytr")
      .notNull(),
    paymentStatus: varchar("payment_status", { length: 40 })
      .default("pending")
      .notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    orderNumberIndex: uniqueIndex("orders_order_number_idx").on(table.orderNumber),
    merchantOidIndex: uniqueIndex("orders_merchant_oid_idx").on(table.merchantOid),
    customerIndex: index("orders_customer_idx").on(table.customerId)
  })
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    productId: uuid("product_id").references(() => products.id),
    variantId: uuid("variant_id").references(() => productVariants.id),
    productName: varchar("product_name", { length: 180 }).notNull(),
    variantName: varchar("variant_name", { length: 180 }),
    sku: varchar("sku", { length: 120 }),
    quantity: integer("quantity").notNull(),
    unitPriceKurus: integer("unit_price_kurus").notNull(),
    lineTotalKurus: integer("line_total_kurus").notNull()
  },
  (table) => ({
    orderIndex: index("order_items_order_idx").on(table.orderId)
  })
);

export const paytrTransactions = pgTable(
  "paytr_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    merchantOid: varchar("merchant_oid", { length: 80 }).notNull(),
    iframeToken: varchar("iframe_token", { length: 255 }),
    paymentAmountKurus: integer("payment_amount_kurus").notNull(),
    totalAmountKurus: integer("total_amount_kurus"),
    status: paytrStatusEnum("status").default("created").notNull(),
    rawRequest: jsonb("raw_request"),
    rawCallback: jsonb("raw_callback"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    orderIndex: uniqueIndex("paytr_transactions_order_idx").on(table.orderId),
    merchantOidIndex: uniqueIndex("paytr_transactions_merchant_oid_idx").on(
      table.merchantOid
    )
  })
);

export const serviceLeads = pgTable(
  "service_leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    leadType: varchar("lead_type", { length: 80 }).notNull(),
    status: leadStatusEnum("status").default("new").notNull(),
    fullName: varchar("full_name", { length: 140 }).notNull(),
    email: varchar("email", { length: 180 }),
    phone: varchar("phone", { length: 32 }).notNull(),
    city: varchar("city", { length: 80 }),
    district: varchar("district", { length: 80 }),
    projectType: varchar("project_type", { length: 80 }),
    message: text("message"),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    statusIndex: index("service_leads_status_idx").on(table.status)
  })
);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    slugIndex: uniqueIndex("blog_posts_slug_idx").on(table.slug)
  })
);
