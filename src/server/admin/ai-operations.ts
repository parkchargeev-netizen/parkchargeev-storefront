import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { hasDatabaseConfig } from "@/lib/runtime-config";
import { recordAuditLog } from "@/server/admin/audit";
import { getAdminDashboardSnapshot } from "@/server/admin/dashboard";
import { createAdminNotification, getAdminRiskSnapshot } from "@/server/admin/operations";
import type {
  adminAiGenerateSchema,
  adminAutomationRunSchema,
  adminAutomationSchema,
  adminListQuerySchema
} from "@/server/admin/validators";
import type { AdminSessionPayload } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import {
  adminAutomationRuns,
  adminAutomations,
  adminDailyReports,
  aiGenerationRuns,
  aiInsights,
  inventoryMovements,
  orders,
  paytrTransactions,
  productVariants,
  products
} from "@/server/db/schema";

type ListQueryInput = z.infer<typeof adminListQuerySchema>;
type AiGenerateInput = z.infer<typeof adminAiGenerateSchema>;
type AutomationInput = z.infer<typeof adminAutomationSchema>;
type AutomationRunInput = z.infer<typeof adminAutomationRunSchema>;

type AiInsightPayload = {
  title: string;
  summary: string;
  severity: "info" | "success" | "warning" | "critical";
  confidence: number;
  actionLabel: string;
  actionHref: string;
  insights: string[];
};

const defaultAiModules = [
  {
    key: "operations_assistant",
    title: "AI Operasyon Asistanı",
    description: "Satış, sipariş, stok, risk ve bildirim sinyallerinden günlük aksiyon önerir.",
    href: "/admin?ai=operations"
  },
  {
    key: "product_description",
    title: "AI Ürün Açıklaması",
    description: "Eksik ürün açıklaması, teknik özet ve müşteri odaklı metin önerisi üretir.",
    href: "/admin/urunler"
  },
  {
    key: "seo_suggestions",
    title: "AI SEO Önerileri",
    description: "Başlık, meta açıklama ve arama niyeti önerileri hazırlar.",
    href: "/admin/urunler?status=draft"
  },
  {
    key: "stock_risk",
    title: "AI Stok Riski",
    description: "Kritik stok ve satış temposu sinyallerinden risk özeti çıkarır.",
    href: "/admin/envanter"
  },
  {
    key: "sales_forecast",
    title: "AI Satış Tahmini",
    description: "Gelir ve sipariş trendinden yakın dönem satış tahmini sunar.",
    href: "/admin/siparisler"
  },
  {
    key: "campaign_suggestion",
    title: "AI Kampanya Önerisi",
    description: "Düşük hareketli veya yüksek potansiyelli ürünler için kampanya önerir.",
    href: "/admin/kampanyalar"
  },
  {
    key: "risk_summary",
    title: "AI Risk Özeti",
    description: "Risk radarındaki sinyalleri yönetici özetine çevirir.",
    href: "/admin/risk"
  },
  {
    key: "customer_order_analysis",
    title: "AI Müşteri/Sipariş Analizi",
    description: "Sipariş ve müşteri verisinden operasyonel fırsatları çıkarır.",
    href: "/admin/siparisler"
  },
  {
    key: "log_summary",
    title: "AI Hata ve Log Özeti",
    description: "Audit ve sistem sinyallerinden güvenlik/operasyon özeti üretir.",
    href: "/admin/audit"
  },
  {
    key: "daily_report",
    title: "AI Günlük Rapor",
    description: "Günlük gelir, risk ve aksiyonları tek raporda toplar.",
    href: "/admin/yapay-zeka?module=daily_report"
  }
] as const;

function startTimer() {
  const startedAt = Date.now();
  return () => Date.now() - startedAt;
}

function getOpenAiConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1";

  return {
    apiKey,
    model,
    enabled: Boolean(apiKey)
  };
}

function clampConfidence(value: unknown) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 60;
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeAiPayload(value: unknown, fallback: AiInsightPayload): AiInsightPayload {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const input = value as Partial<AiInsightPayload>;
  const severityValues = new Set(["info", "success", "warning", "critical"]);
  const severity = severityValues.has(String(input.severity))
    ? (input.severity as AiInsightPayload["severity"])
    : fallback.severity;

  return {
    title: String(input.title || fallback.title).slice(0, 180),
    summary: String(input.summary || fallback.summary).slice(0, 4000),
    severity,
    confidence: clampConfidence(input.confidence),
    actionLabel: String(input.actionLabel || fallback.actionLabel).slice(0, 120),
    actionHref: String(input.actionHref || fallback.actionHref).slice(0, 500),
    insights: Array.isArray(input.insights)
      ? input.insights.map((item) => String(item).slice(0, 300)).slice(0, 8)
      : fallback.insights
  };
}

function getResponseText(response: unknown) {
  if (!response || typeof response !== "object") {
    return "";
  }

  const candidate = response as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ text?: unknown; type?: string }> }>;
  };

  if (typeof candidate.output_text === "string") {
    return candidate.output_text;
  }

  return (
    candidate.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => (typeof content.text === "string" ? content.text : ""))
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function heuristicInsight(moduleKey: string, context: Record<string, unknown>): AiInsightPayload {
  const risk = context.risk as { score?: number; level?: string } | undefined;
  const dashboard = context.dashboard as
    | { kpis?: { pendingOrders?: number; monthRevenue?: number; newCustomers?: number } }
    | undefined;

  const pendingOrders = Number(dashboard?.kpis?.pendingOrders ?? 0);
  const riskScore = Number(risk?.score ?? 0);
  const severity: AiInsightPayload["severity"] =
    riskScore >= 75 || pendingOrders >= 20 ? "critical" : riskScore >= 50 ? "warning" : "info";

  return {
    title: "AI önerisi hazır",
    summary:
      "OpenAI anahtarı tanımlı değilse sistem mevcut operasyon verilerinden güvenli, kural tabanlı bir öneri üretir. Kritik kuyruklar, risk skoru ve eksik içerik alanları önceliklendirildi.",
    severity,
    confidence: 62,
    actionLabel: pendingOrders > 0 ? "Siparişleri incele" : "Risk radarını aç",
    actionHref: pendingOrders > 0 ? "/admin/siparisler" : "/admin/risk",
    insights: [
      `Risk skoru: ${riskScore}/100`,
      `Bekleyen sipariş: ${pendingOrders}`,
      `Bu ay gelir: ${Number(dashboard?.kpis?.monthRevenue ?? 0)} kuruş`,
      moduleKey === "daily_report"
        ? "Günlük rapor için stok, ödeme ve sipariş sinyalleri birlikte değerlendirildi."
        : "AI merkezi gerçek veri yoksa sahte içerik göstermez."
    ]
  };
}

async function buildAiContext(moduleKey: string, input: AiGenerateInput) {
  const [dashboard, risk] = await Promise.all([getAdminDashboardSnapshot(), getAdminRiskSnapshot()]);

  return {
    moduleKey,
    entityType: input.entityType || null,
    entityId: input.entityId || null,
    prompt: input.prompt || null,
    generatedAt: new Date().toISOString(),
    dashboard: {
      kpis: dashboard.kpis,
      charts: dashboard.charts,
      recentOrders: dashboard.activity.recentOrders.slice(0, 5)
    },
    risk,
    guardrails: [
      "Sadece admin önerisi üret; veriyi otomatik değiştirme.",
      "PayTR, Supabase ve OpenAI secret değerlerini asla döndürme.",
      "Öneriler kısa, uygulanabilir ve Türkçe olsun."
    ]
  };
}

async function requestOpenAiInsight(moduleKey: string, context: Record<string, unknown>) {
  const config = getOpenAiConfig();
  const fallback = heuristicInsight(moduleKey, context);

  if (!config.enabled) {
    return {
      provider: "heuristic",
      model: null,
      payload: fallback
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.model,
      input: [
        {
          role: "system",
          content:
            "ParkChargeEV admin paneli icin guvenli, kisa ve uygulanabilir Turkce operasyon onerileri uret."
        },
        {
          role: "user",
          content: JSON.stringify(context)
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "parkchargeev_admin_insight",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              summary: { type: "string" },
              severity: { type: "string", enum: ["info", "success", "warning", "critical"] },
              confidence: { type: "integer", minimum: 0, maximum: 100 },
              actionLabel: { type: "string" },
              actionHref: { type: "string" },
              insights: {
                type: "array",
                items: { type: "string" },
                minItems: 1,
                maxItems: 8
              }
            },
            required: [
              "title",
              "summary",
              "severity",
              "confidence",
              "actionLabel",
              "actionHref",
              "insights"
            ]
          }
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with ${response.status}`);
  }

  const data = (await response.json()) as unknown;
  const text = getResponseText(data);
  const parsed = text ? JSON.parse(text) : fallback;

  return {
    provider: "openai",
    model: config.model,
    payload: normalizeAiPayload(parsed, fallback)
  };
}

function revalidateAdminIntelligence() {
  revalidateTag("admin-dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/yapay-zeka");
  revalidatePath("/admin/otomasyonlar");
  revalidatePath("/admin/bildirimler");
}

export function getAdminAiModules() {
  return defaultAiModules;
}

export async function listAdminAiInsights(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], nextCursor: null };
  }

  const db = getDb();
  const conditions = [];

  if (input.q) {
    conditions.push(or(ilike(aiInsights.title, `%${input.q}%`), ilike(aiInsights.summary, `%${input.q}%`)));
  }

  if (input.status) {
    conditions.push(eq(aiInsights.status, input.status));
  }

  const rows = await db
    .select()
    .from(aiInsights)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(aiInsights.createdAt))
    .limit(input.limit);

  return { items: rows, nextCursor: null };
}

export async function listAdminAiRuns(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return [];
  }

  const db = getDb();
  return db.select().from(aiGenerationRuns).orderBy(desc(aiGenerationRuns.createdAt)).limit(input.limit);
}

export async function generateAdminAiInsight(
  input: AiGenerateInput,
  actor: AdminSessionPayload | null
) {
  const finishedIn = startTimer();
  const context = await buildAiContext(input.moduleKey, input);
  let status = "success";
  let errorMessage: string | null = null;
  let result: Awaited<ReturnType<typeof requestOpenAiInsight>>;

  try {
    result = await requestOpenAiInsight(input.moduleKey, context);
  } catch (error) {
    status = "failed";
    errorMessage = error instanceof Error ? error.message : "AI önerisi üretilemedi.";
    result = {
      provider: "heuristic",
      model: null,
      payload: heuristicInsight(input.moduleKey, context)
    };
  }

  if (!hasDatabaseConfig()) {
    return { insight: result.payload, provider: result.provider, status, errorMessage };
  }

  const db = getDb();
  const durationMs = finishedIn();
  const [run] = await db
    .insert(aiGenerationRuns)
    .values({
      moduleKey: input.moduleKey,
      provider: result.provider,
      model: result.model,
      status,
      inputPayload: context,
      outputPayload: result.payload,
      errorMessage,
      durationMs,
      createdByAdminId: actor?.sub ?? null
    })
    .returning();

  const [insight] = await db
    .insert(aiInsights)
    .values({
      moduleKey: input.moduleKey,
      title: result.payload.title,
      summary: result.payload.summary,
      severity: result.payload.severity,
      confidence: result.payload.confidence,
      actionLabel: result.payload.actionLabel,
      actionHref: result.payload.actionHref,
      sourceType: input.entityType || "admin_ai",
      sourceId: input.entityId || run.id,
      payload: {
        insights: result.payload.insights,
        provider: result.provider,
        runId: run.id,
        errorMessage
      },
      createdByAdminId: actor?.sub ?? null
    })
    .returning();

  await recordAuditLog({
    db,
    actor,
    entityType: "ai_insight",
    entityId: insight.id,
    action: "generate",
    summary: `${input.moduleKey} modülü için AI önerisi üretildi.`
  });

  revalidateAdminIntelligence();

  return { insight, provider: result.provider, status, errorMessage };
}

const defaultAutomations = [
  "critical_stock_notification",
  "payment_failure_risk",
  "delayed_order_alert",
  "missing_product_content",
  "daily_admin_report"
] as const;

export async function ensureDefaultAutomations() {
  if (!hasDatabaseConfig()) {
    return;
  }

  const db = getDb();
  const definitions = [
    {
      automationKey: "critical_stock_notification",
      title: "Kritik stok bildirimi",
      description: "Kritik stok seviyesine düşen ürünler için admin bildirimi üretir.",
      schedule: "hourly"
    },
    {
      automationKey: "payment_failure_risk",
      title: "Ödeme hatası risk uyarısı",
      description: "PayTR başarısız işlem oranı yükseldiğinde risk ve bildirim kaydı üretir.",
      schedule: "hourly"
    },
    {
      automationKey: "delayed_order_alert",
      title: "Geciken sipariş uyarısı",
      description: "Bekleyen veya hazırlıkta kalan siparişler için aksiyon önerir.",
      schedule: "daily"
    },
    {
      automationKey: "missing_product_content",
      title: "Eksik ürün içerik kontrolü",
      description: "SEO, açıklama veya medya bilgisi eksik ürünleri listeler.",
      schedule: "daily"
    },
    {
      automationKey: "daily_admin_report",
      title: "Günlük admin özet raporu",
      description: "Günlük satış, risk ve operasyon özetini rapora dönüştürür.",
      schedule: "daily"
    }
  ];

  for (const definition of definitions) {
    await db
      .insert(adminAutomations)
      .values({
        ...definition,
        status: "active",
        triggerType: "scheduled"
      })
      .onConflictDoNothing({ target: adminAutomations.automationKey });
  }
}

export async function listAdminAutomations(input: ListQueryInput) {
  if (!hasDatabaseConfig()) {
    return { items: [], runs: [] };
  }

  await ensureDefaultAutomations();
  const db = getDb();
  const conditions = [];

  if (input.q) {
    conditions.push(
      or(ilike(adminAutomations.title, `%${input.q}%`), ilike(adminAutomations.description, `%${input.q}%`))
    );
  }

  if (input.status) {
    conditions.push(eq(adminAutomations.status, input.status));
  }

  const [items, runs] = await Promise.all([
    db
      .select()
      .from(adminAutomations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(adminAutomations.updatedAt))
      .limit(input.limit),
    db
      .select()
      .from(adminAutomationRuns)
      .orderBy(desc(adminAutomationRuns.createdAt))
      .limit(12)
  ]);

  return { items, runs };
}

export async function upsertAdminAutomation(
  input: AutomationInput,
  actor: AdminSessionPayload | null
) {
  if (!hasDatabaseConfig()) {
    return input;
  }

  const db = getDb();
  const values = {
    automationKey: input.automationKey,
    title: input.title,
    description: input.description,
    status: input.status,
    triggerType: input.triggerType,
    schedule: input.schedule,
    config: input.config,
    createdByAdminId: actor?.sub ?? null,
    updatedAt: new Date()
  };

  const [automation] = input.id
    ? await db.update(adminAutomations).set(values).where(eq(adminAutomations.id, input.id)).returning()
    : await db
        .insert(adminAutomations)
        .values(values)
        .onConflictDoUpdate({
          target: adminAutomations.automationKey,
          set: values
        })
        .returning();

  await recordAuditLog({
    db,
    actor,
    entityType: "admin_automation",
    entityId: automation.id,
    action: input.id ? "update" : "upsert",
    summary: `${automation.title} otomasyonu kaydedildi.`
  });

  revalidateAdminIntelligence();
  return automation;
}

async function getAutomationSignals(key: string) {
  if (!hasDatabaseConfig()) {
    return { count: 0, message: "Veritabanı bağlı değil.", payload: {} };
  }

  const db = getDb();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  if (key === "critical_stock_notification") {
    const rows = await db
      .select({
        id: productVariants.id,
        sku: productVariants.sku,
        title: productVariants.title,
        stockQuantity: productVariants.stockQuantity,
        minimumStockThreshold: products.minimumStockThreshold,
        productName: products.name
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(
        and(
          eq(products.status, "active"),
          lte(productVariants.stockQuantity, products.minimumStockThreshold)
        )
      )
      .limit(20);

    return {
      count: rows.length,
      message:
        rows.length > 0
          ? `${rows.length} ürün kritik stok seviyesinde.`
          : "Kritik stokta ürün bulunmadı.",
      payload: { products: rows }
    };
  }

  if (key === "payment_failure_risk") {
    const [row] = await db
      .select({
        failures: sql<number>`count(*)::int`
      })
      .from(paytrTransactions)
      .where(and(eq(paytrTransactions.status, "callback_failed"), gte(paytrTransactions.updatedAt, oneDayAgo)));

    return {
      count: Number(row?.failures ?? 0),
      message:
        Number(row?.failures ?? 0) > 0
          ? `Son 24 saatte ${Number(row?.failures ?? 0)} ödeme hatası oluştu.`
          : "Son 24 saatte ödeme hatası sinyali yok.",
      payload: row ?? {}
    };
  }

  if (key === "delayed_order_alert") {
    const rows = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        updatedAt: orders.updatedAt
      })
      .from(orders)
      .where(
        and(
          or(eq(orders.status, "pending_confirmation"), eq(orders.status, "payment_processing"), eq(orders.status, "paid")),
          lte(orders.updatedAt, oneDayAgo)
        )
      )
      .limit(20);

    return {
      count: rows.length,
      message:
        rows.length > 0
          ? `${rows.length} sipariş 24 saatten uzun süredir aksiyon bekliyor.`
          : "Geciken sipariş sinyali bulunmadı.",
      payload: { orders: rows }
    };
  }

  if (key === "missing_product_content") {
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        seoTitle: products.seoTitle,
        seoDescription: products.seoDescription,
        shortDescription: products.shortDescription
      })
      .from(products)
      .where(
        and(
          eq(products.status, "active"),
          or(
            sql`${products.seoTitle} is null`,
            sql`${products.seoDescription} is null`,
            sql`length(${products.shortDescription}) < 30`
          )
        )
      )
      .limit(20);

    return {
      count: rows.length,
      message:
        rows.length > 0
          ? `${rows.length} aktif üründe SEO veya açıklama eksikliği var.`
          : "Aktif ürünlerde kritik içerik eksiği bulunmadı.",
      payload: { products: rows }
    };
  }

  const [movementCount] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(inventoryMovements)
    .where(gte(inventoryMovements.createdAt, sevenDaysAgo));

  return {
    count: Number(movementCount?.total ?? 0),
    message: "Günlük yönetici özeti oluşturuldu.",
    payload: { inventoryMovementsLast7Days: Number(movementCount?.total ?? 0) }
  };
}

export async function runAdminAutomation(
  automationIdOrKey: string,
  input: AutomationRunInput,
  actor: AdminSessionPayload | null
) {
  if (!hasDatabaseConfig()) {
    return { ok: true, summary: "Veritabanı bağlı olmadığı için otomasyon simüle edildi." };
  }

  await ensureDefaultAutomations();
  const db = getDb();
  const finishedIn = startTimer();
  const [automation] = await db
    .select()
    .from(adminAutomations)
    .where(
      or(eq(adminAutomations.id, automationIdOrKey), eq(adminAutomations.automationKey, automationIdOrKey))
    )
    .limit(1);

  if (!automation) {
    throw new Error("Otomasyon bulunamadı.");
  }

  if (automation.status !== "active") {
    const [run] = await db
      .insert(adminAutomationRuns)
      .values({
        automationId: automation.id,
        automationKey: automation.automationKey,
        triggerSource: input.triggerSource,
        status: "skipped",
        summary: "Otomasyon pasif olduğu için çalıştırılmadı.",
        durationMs: finishedIn(),
        createdByAdminId: actor?.sub ?? null
      })
      .returning();

    return { ok: true, run, summary: run.summary };
  }

  const signals = await getAutomationSignals(automation.automationKey);
  const status = "success";
  const summary = signals.message;

  const [run] = await db
    .insert(adminAutomationRuns)
    .values({
      automationId: automation.id,
      automationKey: automation.automationKey,
      triggerSource: input.triggerSource,
      status,
      summary,
      resultPayload: signals.payload,
      durationMs: finishedIn(),
      createdByAdminId: actor?.sub ?? null
    })
    .returning();

  await db
    .update(adminAutomations)
    .set({
      lastRunAt: new Date(),
      lastStatus: status,
      lastMessage: summary,
      updatedAt: new Date()
    })
    .where(eq(adminAutomations.id, automation.id));

  if (signals.count > 0) {
    await createAdminNotification({
      title: automation.title,
      body: summary,
      tone: signals.count >= 10 ? "critical" : "warning",
      href:
        automation.automationKey === "critical_stock_notification"
          ? "/admin/envanter"
          : automation.automationKey === "payment_failure_risk"
            ? "/admin/paytr"
            : automation.automationKey === "missing_product_content"
              ? "/admin/urunler"
              : "/admin"
    });
  }

  if (automation.automationKey === "daily_admin_report") {
    const today = new Date().toISOString().slice(0, 10);
    const insight = await generateAdminAiInsight(
      {
        moduleKey: "daily_report",
        entityType: "automation",
        entityId: run.id,
        prompt: "Günlük admin raporu üret."
      },
      actor
    );
    const reportSummary = String((insight.insight as { summary?: unknown }).summary || summary);

    await db
      .insert(adminDailyReports)
      .values({
        reportDate: today,
        title: "Günlük admin raporu",
        summary: reportSummary,
        payload: insight,
        createdByRunId: run.id
      })
      .onConflictDoUpdate({
        target: adminDailyReports.reportDate,
        set: {
          summary: reportSummary,
          payload: insight
        }
      });
  }

  await recordAuditLog({
    db,
    actor,
    entityType: "admin_automation",
    entityId: automation.id,
    action: "run",
    summary: `${automation.title} otomasyonu çalıştırıldı.`
  });

  revalidateAdminIntelligence();

  return { ok: true, run, summary };
}

export async function runScheduledAdminAutomations() {
  if (!hasDatabaseConfig()) {
    return { ok: true, runs: [] };
  }

  await ensureDefaultAutomations();
  const db = getDb();
  const automations = await db
    .select()
    .from(adminAutomations)
    .where(and(eq(adminAutomations.status, "active"), inArray(adminAutomations.automationKey, [...defaultAutomations])))
    .orderBy(adminAutomations.automationKey);

  const runs = [];

  for (const automation of automations) {
    runs.push(
      await runAdminAutomation(
        automation.id,
        {
          triggerSource: "cron"
        },
        null
      )
    );
  }

  return { ok: true, runs };
}
