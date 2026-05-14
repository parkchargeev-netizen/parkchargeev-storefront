import { count, desc, gte, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { getFallbackAdminDashboardSnapshot } from "@/server/admin/fallback-store";
import { getDb } from "@/server/db/client";
import {
  adminSessions,
  auditLogs,
  customers,
  orders,
  quoteRequests,
  serviceLeads
} from "@/server/db/schema";

type AdminDb = ReturnType<typeof getDb>;

export type AdminDashboardSnapshot = {
  kpis: {
    todayRevenue: number;
    monthRevenue: number;
    targetProgress: number;
    pendingOrders: number;
    pendingQuotes: number;
    openServiceRequests: number;
    completedInstallations: number;
    newCustomers: number;
  };
  charts: {
    revenueTrend: Array<{ month: string; total: number }>;
    quoteDistribution: Array<{ status: string; total: number }>;
    orderDistribution: Array<{ status: string; total: number }>;
  };
  activity: {
    recentOrders: Array<{
      id: string;
      orderNumber: string;
      customerName: string | null;
      totalKurus: number;
      status: string;
      updatedAt: Date;
    }>;
    recentQuotes: Array<{
      id: string;
      fullName: string;
      companyName: string | null;
      status: string;
      updatedAt: Date;
    }>;
    recentServiceRequests: Array<{
      id: string;
      fullName: string;
      leadType: string;
      status: string;
      createdAt: Date;
    }>;
  };
  security: {
    activeSessions: number;
    recentAuditLogs: Array<{
      id: string;
      entityType: string;
      action: string;
      summary: string | null;
      createdAt: Date;
    }>;
  };
};

const revenueStatuses = ["paid", "confirmed", "shipped", "delivered", "fulfilled"] as const;
const pendingOrderStatuses = ["pending_payment", "payment_processing", "pending_confirmation"] as const;
const activeQuoteStatuses = ["new", "reviewing", "proposal_sent", "negotiation"] as const;
const openLeadStatuses = ["new", "contacted", "qualified"] as const;
const completedInstallationStatuses = ["delivered", "fulfilled"] as const;

function enumValues(values: readonly string[]) {
  return sql.join(
    values.map((value) => sql`${value}`),
    sql`, `
  );
}

const revenueStatusArray = sql`array[${enumValues(revenueStatuses)}]::order_status[]`;
const pendingOrderStatusArray = sql`array[${enumValues(pendingOrderStatuses)}]::order_status[]`;
const activeQuoteStatusArray = sql`array[${enumValues(activeQuoteStatuses)}]::quote_request_status[]`;
const openLeadStatusArray = sql`array[${enumValues(openLeadStatuses)}]::lead_status[]`;
const completedInstallationStatusArray = sql`array[${enumValues(completedInstallationStatuses)}]::order_status[]`;

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date: Date) {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
}

function emptyDashboardSnapshot(): AdminDashboardSnapshot {
  return {
    kpis: {
      todayRevenue: 0,
      monthRevenue: 0,
      targetProgress: 0,
      pendingOrders: 0,
      pendingQuotes: 0,
      openServiceRequests: 0,
      completedInstallations: 0,
      newCustomers: 0
    },
    charts: {
      revenueTrend: [],
      quoteDistribution: [],
      orderDistribution: []
    },
    activity: {
      recentOrders: [],
      recentQuotes: [],
      recentServiceRequests: []
    },
    security: {
      activeSessions: 0,
      recentAuditLogs: []
    }
  };
}

function dashboardWindow(now = new Date()) {
  return {
    now,
    todayStartIso: startOfDay(now).toISOString(),
    monthStartIso: startOfMonth(now).toISOString(),
    weekStartIso: startOfWeek(now).toISOString(),
    sevenDaysAgoIso: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

function monthlyTargetKurus() {
  return Number(process.env.ADMIN_MONTHLY_REVENUE_TARGET_KURUS ?? "2500000");
}

function queryKpis(db: AdminDb, window: ReturnType<typeof dashboardWindow>) {
  return db.execute(sql`
    select
      (select coalesce(sum(${orders.totalKurus}), 0)::int from ${orders}
        where ${orders.status} = any(${revenueStatusArray})
          and ${orders.createdAt} >= ${window.todayStartIso}::timestamptz) as today_revenue,
      (select coalesce(sum(${orders.totalKurus}), 0)::int from ${orders}
        where ${orders.status} = any(${revenueStatusArray})
          and ${orders.createdAt} >= ${window.monthStartIso}::timestamptz) as month_revenue,
      (select count(*)::int from ${orders}
        where ${orders.status} = any(${pendingOrderStatusArray})) as pending_orders,
      (select count(*)::int from ${quoteRequests}
        where ${quoteRequests.status} = any(${activeQuoteStatusArray})) as pending_quotes,
      (select count(*)::int from ${serviceLeads}
        where ${serviceLeads.leadType} ilike '%servis%'
          and ${serviceLeads.status} = any(${openLeadStatusArray})) as open_service_requests,
      (select count(*)::int from ${orders}
        where ${orders.status} = any(${completedInstallationStatusArray})
          and ${orders.updatedAt} >= ${window.weekStartIso}::timestamptz) as completed_installations,
      (select count(*)::int from ${customers}
        where ${customers.createdAt} >= ${window.sevenDaysAgoIso}::timestamptz) as new_customers
  `);
}

function queryRecentOrders(db: AdminDb) {
  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: orders.customerName,
      totalKurus: orders.totalKurus,
      status: orders.status,
      updatedAt: orders.updatedAt
    })
    .from(orders)
    .orderBy(desc(orders.updatedAt))
    .limit(10);
}

function queryRecentQuotes(db: AdminDb) {
  return db
    .select({
      id: quoteRequests.id,
      fullName: quoteRequests.fullName,
      companyName: quoteRequests.companyName,
      status: quoteRequests.status,
      updatedAt: quoteRequests.updatedAt
    })
    .from(quoteRequests)
    .orderBy(desc(quoteRequests.updatedAt))
    .limit(5);
}

function queryRecentServiceRequests(db: AdminDb) {
  return db
    .select({
      id: serviceLeads.id,
      fullName: serviceLeads.fullName,
      leadType: serviceLeads.leadType,
      status: serviceLeads.status,
      createdAt: serviceLeads.createdAt
    })
    .from(serviceLeads)
    .orderBy(desc(serviceLeads.createdAt))
    .limit(3);
}

function queryRevenueTrend(db: AdminDb) {
  return db.execute(sql`
    select
      to_char(date_trunc('month', ${orders.createdAt}), 'YYYY-MM') as month,
      coalesce(sum(${orders.totalKurus}), 0)::int as total
    from ${orders}
    where ${orders.status} = any(${revenueStatusArray})
      and ${orders.createdAt} >= date_trunc('month', now()) - interval '11 months'
    group by 1
    order by 1 asc
  `);
}

function queryQuoteDistribution(db: AdminDb) {
  return db.execute(sql`
    select ${quoteRequests.status}::text as status, count(*)::int as total
    from ${quoteRequests}
    group by ${quoteRequests.status}
    order by 1 asc
  `);
}

function queryOrderDistribution(db: AdminDb) {
  return db.execute(sql`
    select ${orders.status}::text as status, count(*)::int as total
    from ${orders}
    group by ${orders.status}
    order by 1 asc
  `);
}

function queryActiveSessions(db: AdminDb, now: Date) {
  return db
    .select({ total: count() })
    .from(adminSessions)
    .where(gte(adminSessions.expiresAt, now));
}

function queryRecentAuditLogs(db: AdminDb) {
  return db
    .select({
      id: auditLogs.id,
      entityType: auditLogs.entityType,
      action: auditLogs.action,
      summary: auditLogs.summary,
      createdAt: auditLogs.createdAt
    })
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(4);
}

async function loadAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  if (!hasDatabaseConfig()) {
    return getFallbackAdminDashboardSnapshot();
  }

  const db = getDb();
  const window = dashboardWindow();
  const targetKurus = monthlyTargetKurus();

  try {
    const [
      kpiRows,
      recentOrders,
      recentQuotes,
      recentServiceRequests,
      revenueTrendRows,
      quoteDistributionRows,
      orderDistributionRows,
      activeSessionRows,
      recentAuditLogs
    ] = await Promise.all([
      queryKpis(db, window),
      queryRecentOrders(db),
      queryRecentQuotes(db),
      queryRecentServiceRequests(db),
      queryRevenueTrend(db),
      queryQuoteDistribution(db),
      queryOrderDistribution(db),
      queryActiveSessions(db, window.now),
      queryRecentAuditLogs(db)
    ]);

    const kpis = kpiRows[0] as Record<string, unknown> | undefined;
    const todayRevenue = Number(kpis?.today_revenue ?? 0);
    const monthRevenue = Number(kpis?.month_revenue ?? 0);

    return {
      kpis: {
        todayRevenue,
        monthRevenue,
        targetProgress: targetKurus > 0 ? (monthRevenue / targetKurus) * 100 : 0,
        pendingOrders: Number(kpis?.pending_orders ?? 0),
        pendingQuotes: Number(kpis?.pending_quotes ?? 0),
        openServiceRequests: Number(kpis?.open_service_requests ?? 0),
        completedInstallations: Number(kpis?.completed_installations ?? 0),
        newCustomers: Number(kpis?.new_customers ?? 0)
      },
      charts: {
        revenueTrend: revenueTrendRows.map((row) => ({
          month: String(row.month),
          total: Number(row.total)
        })),
        quoteDistribution: quoteDistributionRows.map((row) => ({
          status: String(row.status),
          total: Number(row.total)
        })),
        orderDistribution: orderDistributionRows.map((row) => ({
          status: String(row.status),
          total: Number(row.total)
        }))
      },
      activity: {
        recentOrders,
        recentQuotes,
        recentServiceRequests
      },
      security: {
        activeSessions: Number(activeSessionRows[0]?.total ?? 0),
        recentAuditLogs
      }
    };
  } catch (error) {
    console.warn("Admin dashboard snapshot could not be loaded.", error);
    return emptyDashboardSnapshot();
  }
}

export const getAdminDashboardSnapshot = unstable_cache(
  loadAdminDashboardSnapshot,
  ["admin-dashboard-snapshot"],
  { revalidate: 60, tags: ["admin-dashboard"] }
);
