import { desc, ilike, or } from "drizzle-orm";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { articles, products as fallbackProducts } from "@/lib/mock-data";
import { normalizeSearchText } from "@/lib/search-normalization";
import { canAccessAdminPath, type AdminRole } from "@/server/auth/authorization";
import { getDb } from "@/server/db/client";
import { orders, products, quoteRequests, serviceLeads, sitePages } from "@/server/db/schema";

export type AdminGlobalSearchResult = {
  href: string;
  label: string;
  detail: string;
  group: string;
};

function matchesQuery(query: string, text: string) {
  return normalizeSearchText(text).includes(query);
}

function allowed(role: AdminRole, result: AdminGlobalSearchResult) {
  return canAccessAdminPath(role, result.href.replace("/api", ""));
}

function fallbackSearch(query: string, role: AdminRole): AdminGlobalSearchResult[] {
  const productResults = fallbackProducts
    .filter((product) =>
      matchesQuery(query, `${product.name} ${product.category} ${product.powerLabel} ${product.summary}`)
    )
    .slice(0, 5)
    .map((product) => ({
      href: "/admin/urunler",
      label: product.name,
      detail: `${product.category} - ${product.powerLabel}`,
      group: "Ürünler"
    }));
  const contentResults = articles
    .filter((article) => matchesQuery(query, `${article.title} ${article.category} ${article.excerpt}`))
    .slice(0, 4)
    .map((article) => ({
      href: "/admin/blog",
      label: article.title,
      detail: article.category,
      group: "İçerik"
    }));

  return [...productResults, ...contentResults].filter((result) =>
    allowed(role, result)
  );
}

export async function searchAdminWorkspace(query: string, role: AdminRole) {
  const rawQuery = query.trim();
  const normalizedQuery = normalizeSearchText(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  if (!hasDatabaseConfig()) {
    return fallbackSearch(normalizedQuery, role);
  }

  try {
    const db = getDb();
    const pattern = `%${rawQuery}%`;
    const [productRows, orderRows, quoteRows, serviceRows, pageRows] = await Promise.all([
      db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          status: products.status,
          powerKw: products.powerKw
        })
        .from(products)
        .where(or(ilike(products.name, pattern), ilike(products.slug, pattern)))
        .orderBy(desc(products.updatedAt))
        .limit(5),
      db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerName: orders.customerName,
          customerEmail: orders.customerEmail,
          status: orders.status
        })
        .from(orders)
        .where(
          or(
            ilike(orders.orderNumber, pattern),
            ilike(orders.customerName, pattern),
            ilike(orders.customerEmail, pattern)
          )
        )
        .orderBy(desc(orders.updatedAt))
        .limit(5),
      db
        .select({
          id: quoteRequests.id,
          fullName: quoteRequests.fullName,
          companyName: quoteRequests.companyName,
          phone: quoteRequests.phone,
          status: quoteRequests.status
        })
        .from(quoteRequests)
        .where(
          or(
            ilike(quoteRequests.fullName, pattern),
            ilike(quoteRequests.companyName, pattern),
            ilike(quoteRequests.phone, pattern)
          )
        )
        .orderBy(desc(quoteRequests.updatedAt))
        .limit(5),
      db
        .select({
          id: serviceLeads.id,
          fullName: serviceLeads.fullName,
          leadType: serviceLeads.leadType,
          phone: serviceLeads.phone,
          status: serviceLeads.status
        })
        .from(serviceLeads)
        .where(
          or(
            ilike(serviceLeads.fullName, pattern),
            ilike(serviceLeads.leadType, pattern),
            ilike(serviceLeads.phone, pattern)
          )
        )
        .orderBy(desc(serviceLeads.createdAt))
        .limit(5),
      db
        .select({
          id: sitePages.id,
          title: sitePages.title,
          slug: sitePages.slug,
          status: sitePages.status
        })
        .from(sitePages)
        .where(or(ilike(sitePages.title, pattern), ilike(sitePages.slug, pattern)))
        .orderBy(desc(sitePages.updatedAt))
        .limit(5)
    ]);

    const results: AdminGlobalSearchResult[] = [
      ...productRows.map((product) => ({
        href: `/admin/urunler/${product.id}`,
        label: product.name,
        detail: `${product.status}${product.powerKw ? ` - ${product.powerKw}` : ""}`,
        group: "Ürünler"
      })),
      ...orderRows.map((order) => ({
        href: `/admin/siparisler/${order.id}`,
        label: order.orderNumber,
        detail: `${order.customerName ?? order.customerEmail ?? "Müşteri"} - ${order.status}`,
        group: "Siparişler"
      })),
      ...quoteRows.map((quote) => ({
        href: `/admin/teklifler/${quote.id}`,
        label: quote.fullName,
        detail: `${quote.companyName ?? quote.phone} - ${quote.status}`,
        group: "Teklifler"
      })),
      ...serviceRows.map((lead) => ({
        href: `/admin/saha/${lead.id}`,
        label: lead.fullName,
        detail: `${lead.leadType} - ${lead.status}`,
        group: "Saha"
      })),
      ...pageRows.map((page) => ({
        href: `/admin/site?editPage=${page.id}#site-page-editor`,
        label: page.title,
        detail: `${page.slug} - ${page.status}`,
        group: "Site"
      }))
    ];

    return results.filter((result) => allowed(role, result));
  } catch (error) {
    console.warn("Admin global search could not be loaded.", error);
    return fallbackSearch(normalizedQuery, role);
  }
}
