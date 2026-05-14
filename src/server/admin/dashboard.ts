import { sql } from "drizzle-orm";
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

type RecentOrderRow = AdminDashboardSnapshot["activity"]["recentOrders"][number];
type RecentQuoteRow = AdminDashboardSnapshot["activity"]["recentQuotes"][number];
type RecentServiceRequestRow = AdminDashboardSnapshot["activity"]["recentServiceRequests"][number];
type AuditLogRow = AdminDashboardSnapshot["security"]["recentAuditLogs"][number];
type ChartRow = { month?: string; status?: string; total: number };

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function toDate(value: unknown) {
  return value instanceof Date ? value : new Date(String(value));
}

function queryDashboardReadModel(db: AdminDb, window: ReturnType<typeof dashboardWindow>) {
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
        where ${customers.createdAt} >= ${window.sevenDaysAgoIso}::timestamptz) as new_customers,
      (select count(*)::int from ${adminSessions}
        where ${adminSessions.expiresAt} >= ${window.now}) as active_sessions,
      (
        select coalesce(jsonb_agg(jsonb_build_object(
          'month', revenue_trend.month,
          'total', revenue_trend.total
        ) order by revenue_trend.month asc), '[]'::jsonb)
        from (
          select
            to_char(date_trunc('month', ${orders.createdAt}), 'YYYY-MM') as month,
            coalesce(sum(${orders.totalKurus}), 0)::int as total
          from ${orders}
          where ${orders.status} = any(${revenueStatusArray})
            and ${orders.createdAt} >= date_trunc('month', now()) - interval '11 months'
          group by 1
        ) as revenue_trend
      ) as revenue_trend,
      (
        select coalesce(jsonb_agg(jsonb_build_object(
          'status', quote_distribution.status,
          'total', quote_distribution.total
        ) order by quote_distribution.status asc), '[]'::jsonb)
        from (
          select ${quoteRequests.status}::text as status, count(*)::int as total
          from ${quoteRequests}
          group by ${quoteRequests.status}
        ) as quote_distribution
      ) as quote_distribution,
      (
        select coalesce(jsonb_agg(jsonb_build_object(
          'status', order_distribution.status,
          'total', order_distribution.total
        ) order by order_distribution.status asc), '[]'::jsonb)
        from (
          select ${orders.status}::text as status, count(*)::int as total
          from ${orders}
          group by ${orders.status}
        ) as order_distribution
      ) as order_distribution,
      (
        select coalesce(jsonb_agg(jsonb_build_object(
          'id', recent_order.id,
          'orderNumber', recent_order.order_number,
          'customerName', recent_order.customer_name,
          'totalKurus', recent_order.total_kurus,
          'status', recent_order.status,
          'updatedAt', recent_order.updated_at
        ) order by recent_order.updated_at desc), '[]'::jsonb)
        from (
          select
            ${orders.id} as id,
            ${orders.orderNumber} as order_number,
            ${orders.customerName} as customer_name,
            ${orders.totalKurus} as total_kurus,
            ${orders.status}::text as status,
            ${orders.updatedAt} as updated_at
          from ${orders}
          order by ${orders.updatedAt} desc
          limit 10
        ) as recent_order
      ) as recent_orders,
      (
        select coalesce(jsonb_agg(jsonb_build_object(
          'id', recent_quote.id,
          'fullName', recent_quote.full_name,
          'companyName', recent_quote.company_name,
          'status', recent_quote.status,
          'updatedAt', recent_quote.updated_at
        ) order by recent_quote.updated_at desc), '[]'::jsonb)
        from (
          select
            ${quoteRequests.id} as id,
            ${quoteRequests.fullName} as full_name,
            ${quoteRequests.companyName} as company_name,
            ${quoteRequests.status}::text as status,
            ${quoteRequests.updatedAt} as updated_at
          from ${quoteRequests}
          order by ${quoteRequests.updatedAt} desc
          limit 5
        ) as recent_quote
      ) as recent_quotes,
      (
        select coalesce(jsonb_agg(jsonb_build_object(
          'id', recent_service_request.id,
          'fullName', recent_service_request.full_name,
          'leadType', recent_service_request.lead_type,
          'status', recent_service_request.status,
          'createdAt', recent_service_request.created_at
        ) order by recent_service_request.created_at desc), '[]'::jsonb)
        from (
          select
            ${serviceLeads.id} as id,
            ${serviceLeads.fullName} as full_name,
            ${serviceLeads.leadType} as lead_type,
            ${serviceLeads.status}::text as status,
            ${serviceLeads.createdAt} as created_at
          from ${serviceLeads}
          order by ${serviceLeads.createdAt} desc
          limit 3
        ) as recent_service_request
      ) as recent_service_requests,
      (
        select coalesce(jsonb_agg(jsonb_build_object(
          'id', recent_audit_log.id,
          'entityType', recent_audit_log.entity_type,
          'action', recent_audit_log.action,
          'summary', recent_audit_log.summary,
          'createdAt', recent_audit_log.created_at
        ) order by recent_audit_log.created_at desc), '[]'::jsonb)
        from (
          select
            ${auditLogs.id} as id,
            ${auditLogs.entityType} as entity_type,
            ${auditLogs.action} as action,
            ${auditLogs.summary} as summary,
            ${auditLogs.createdAt} as created_at
          from ${auditLogs}
          order by ${auditLogs.createdAt} desc
          limit 4
        ) as recent_audit_log
      ) as recent_audit_logs
  `);
}

async function loadAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  if (!hasDatabaseConfig()) {
    return getFallbackAdminDashboardSnapshot();
  }

  const db = getDb();
  const window = dashboardWindow();
  const targetKurus = monthlyTargetKurus();

  try {
    const readModelRows = await queryDashboardReadModel(db, window);
    const kpis = readModelRows[0] as Record<string, unknown> | undefined;
    const todayRevenue = Number(kpis?.today_revenue ?? 0);
    const monthRevenue = Number(kpis?.month_revenue ?? 0);
    const revenueTrend = asArray<ChartRow>(kpis?.revenue_trend);
    const quoteDistribution = asArray<ChartRow>(kpis?.quote_distribution);
    const orderDistribution = asArray<ChartRow>(kpis?.order_distribution);
    const recentOrders = asArray<RecentOrderRow>(kpis?.recent_orders);
    const recentQuotes = asArray<RecentQuoteRow>(kpis?.recent_quotes);
    const recentServiceRequests = asArray<RecentServiceRequestRow>(kpis?.recent_service_requests);
    const recentAuditLogs = asArray<AuditLogRow>(kpis?.recent_audit_logs);

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
        revenueTrend: revenueTrend.map((row) => ({
          month: String(row.month),
          total: Number(row.total)
        })),
        quoteDistribution: quoteDistribution.map((row) => ({
          status: String(row.status),
          total: Number(row.total)
        })),
        orderDistribution: orderDistribution.map((row) => ({
          status: String(row.status),
          total: Number(row.total)
        }))
      },
      activity: {
        recentOrders: recentOrders.map((order) => ({
          ...order,
          updatedAt: toDate(order.updatedAt)
        })),
        recentQuotes: recentQuotes.map((quote) => ({
          ...quote,
          updatedAt: toDate(quote.updatedAt)
        })),
        recentServiceRequests: recentServiceRequests.map((request) => ({
          ...request,
          createdAt: toDate(request.createdAt)
        }))
      },
      security: {
        activeSessions: Number(kpis?.active_sessions ?? 0),
        recentAuditLogs: recentAuditLogs.map((log) => ({
          ...log,
          createdAt: toDate(log.createdAt)
        }))
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
