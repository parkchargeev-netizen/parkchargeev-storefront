"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Gauge, Home, MapPin, Zap } from "lucide-react";

import { formatPriceTRY } from "@/lib/format";
import type { ProductModel } from "@/lib/mock-data";

type SelectorValues = {
  parking: "home" | "apartment" | "business" | "fleet";
  phase: "single" | "three" | "unknown";
  priority: "budget" | "balanced" | "speed" | "revenue";
  vehicleCount: "one" | "few" | "many";
};

type ScoredProduct = {
  product: ProductModel;
  score: number;
  reasons: string[];
};

const parkingOptions = [
  { value: "home", label: "Ev / villa", detail: "Her sabah hazır araç ve güvenli gece şarjı" },
  { value: "apartment", label: "Site / apartman", detail: "Ortak otopark, yönetim onayı ve adil kullanım" },
  { value: "business", label: "İş yeri", detail: "Çalışan, müşteri, misafir veya filo kullanımı" },
  { value: "fleet", label: "Ticari saha", detail: "Gelir modeli, hızlı şarj ve çok araçlı operasyon" }
] as const;

const phaseOptions = [
  { value: "single", label: "Monofaze", detail: "7.4 kW için ekonomik başlangıç" },
  { value: "three", label: "Üç faz", detail: "11 kW ve 22 kW AC için güçlü altyapı" },
  { value: "unknown", label: "Emin değilim", detail: "Pano ve faz keşifte netleşsin" }
] as const;

const priorityOptions = [
  { value: "budget", label: "Ekonomik", detail: "Başlangıç maliyeti düşük, karar net olsun" },
  { value: "balanced", label: "Dengeli", detail: "Hız, güvenlik ve kurulum maliyeti dengesi" },
  { value: "speed", label: "Hız", detail: "Daha kısa şarj süresi ve yüksek güç" },
  { value: "revenue", label: "Gelir modeli", detail: "Ticari kullanım, raporlama ve saha fizibilitesi" }
] as const;

const vehicleCountOptions = [
  { value: "one", label: "1 araç" },
  { value: "few", label: "2-8 araç" },
  { value: "many", label: "8+ araç" }
] as const;

function scoreProduct(product: ProductModel, values: SelectorValues): ScoredProduct {
  const text = `${product.name} ${product.category} ${product.powerLabel} ${product.summary} ${product.useCases.join(" ")}`.toLocaleLowerCase("tr-TR");
  const reasons: string[] = [];
  let score = 0;

  if (values.phase === "single" && (text.includes("7.4") || text.includes("monofaze"))) {
    score += 35;
    reasons.push("Monofaze altyapıda uygulanabilir");
  }

  if (values.phase === "three" && (text.includes("11kw") || text.includes("22kw") || text.includes("11 kW".toLocaleLowerCase("tr-TR")) || text.includes("22 kW".toLocaleLowerCase("tr-TR")))) {
    score += 28;
    reasons.push("Üç faz altyapıda güçlü AC seçenek");
  }

  if (values.parking === "home" && product.category === "Ev Tipi") {
    score += 35;
    reasons.push("Ev/villa gece şarjına yakın eşleşme");
  }

  if (values.parking === "apartment" && (text.includes("apartman") || text.includes("site") || product.category === "Ev Tipi")) {
    score += 24;
    reasons.push("Site ve apartman karar sürecine uygun");
  }

  if (values.parking === "business" && (product.category.includes("İş") || text.includes("rfid") || text.includes("22kw"))) {
    score += 34;
    reasons.push("İş yeri ve çoklu kullanıcı senaryosuna uygun");
  }

  if (values.parking === "fleet" && (text.includes("dc") || text.includes("filo") || text.includes("60kw"))) {
    score += 40;
    reasons.push("Ticari saha ve filo için güçlü aday");
  }

  if (values.priority === "budget" && product.priceKurus <= 1000000) {
    score += 28;
    reasons.push("Başlangıç maliyeti düşük");
  }

  if (values.priority === "balanced" && (text.includes("11kw") || text.includes("11 kW".toLocaleLowerCase("tr-TR")))) {
    score += 24;
    reasons.push("Hız ve maliyet dengesi iyi");
  }

  if (values.priority === "speed" && (text.includes("22kw") || text.includes("60kw") || text.includes("dc"))) {
    score += 28;
    reasons.push("Daha yüksek güç ihtiyacına yakın");
  }

  if (values.priority === "revenue" && (text.includes("ocpp") || text.includes("rfid") || text.includes("dc") || product.category.includes("İş"))) {
    score += 30;
    reasons.push("Raporlama veya ticari kullanım potansiyeli yüksek");
  }

  if (values.vehicleCount === "one" && product.category === "Ev Tipi") {
    score += 12;
  }

  if (values.vehicleCount === "few" && (text.includes("22kw") || product.category.includes("İş"))) {
    score += 14;
  }

  if (values.vehicleCount === "many" && (text.includes("dc") || text.includes("çift") || text.includes("60kw"))) {
    score += 18;
  }

  if (product.stockLabel === "Stokta") {
    score += 8;
  }

  return {
    product,
    score,
    reasons: reasons.slice(0, 3)
  };
}

export function ProductSelectorClient({ products }: { products: ProductModel[] }) {
  const [values, setValues] = useState<SelectorValues>({
    parking: "home",
    phase: "unknown",
    priority: "balanced",
    vehicleCount: "one"
  });

  const recommendations = useMemo(() => {
    return products
      .map((product) => scoreProduct(product, values))
      .sort((left, right) => right.score - left.score)
      .slice(0, 3);
  }, [products, values]);
  const topRecommendation = recommendations[0];

  function updateValue<Key extends keyof SelectorValues>(key: Key, value: SelectorValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="product-selector-experience grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="selector-config-panel p-6 lg:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
          Akıllı uygunluk seçici
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-on-surface md:text-5xl">
          Aracınıza ve otoparkınıza göre doğru ürünü bulun
        </h1>

        <div className="mt-8 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <MapPin className="h-4 w-4 text-primary" />
              Kurulum yeri
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {parkingOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateValue("parking", option.value)}
                  className={`selector-option rounded-2xl border px-4 py-4 text-left transition ${
                    values.parking === option.value
                      ? "selector-option--active border-primary bg-primary/5"
                      : "border-outline-variant/45 bg-white hover:border-primary/40"
                  }`}
                >
                  <span className="block text-sm font-semibold text-on-surface">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant">
                    {option.detail}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <Zap className="h-4 w-4 text-primary" />
              Elektrik altyapısı
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {phaseOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateValue("phase", option.value)}
                  className={`selector-option rounded-2xl border px-4 py-4 text-left transition ${
                    values.phase === option.value
                      ? "selector-option--active border-primary bg-primary/5"
                      : "border-outline-variant/45 bg-white hover:border-primary/40"
                  }`}
                >
                  <span className="block text-sm font-semibold text-on-surface">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant">
                    {option.detail}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <Gauge className="h-4 w-4 text-primary" />
              Öncelik
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateValue("priority", option.value)}
                  className={`selector-option rounded-2xl border px-4 py-4 text-left transition ${
                    values.priority === option.value
                      ? "selector-option--active border-primary bg-primary/5"
                      : "border-outline-variant/45 bg-white hover:border-primary/40"
                  }`}
                >
                  <span className="block text-sm font-semibold text-on-surface">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-on-surface-variant">
                    {option.detail}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <Home className="h-4 w-4 text-primary" />
              Araç sayısı
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {vehicleCountOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateValue("vehicleCount", option.value)}
                  className={`selector-option rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    values.vehicleCount === option.value
                      ? "selector-option--active border-primary bg-primary/5 text-primary"
                      : "border-outline-variant/45 bg-white text-on-surface hover:border-primary/40"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        {topRecommendation ? (
          <article className="selector-result-card overflow-hidden rounded-[28px] bg-slate-950 p-7 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-200">
              En güçlü öneri
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.06em]">
              {topRecommendation.product.name}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/84">
              {topRecommendation.product.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/[0.14] px-4 py-2 text-sm font-semibold">
                {topRecommendation.product.powerLabel}
              </span>
              <span className="rounded-full bg-white/[0.14] px-4 py-2 text-sm font-semibold">
                {formatPriceTRY(topRecommendation.product.priceKurus)}
              </span>
              <span className="rounded-full bg-white/[0.14] px-4 py-2 text-sm font-semibold">
                Uygunluk {topRecommendation.score}
              </span>
            </div>
            <div className="mt-6 grid gap-2">
              {topRecommendation.reasons.map((reason) => (
                <div key={reason} className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                  {reason}
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/urun/${topRecommendation.product.slug}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
              >
                Ürünü İncele
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/iletisim"
                className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white"
              >
                Keşif Planla
              </Link>
            </div>
          </article>
        ) : null}

        <div className="grid gap-4">
          {recommendations.slice(1).map((recommendation) => (
            <Link
              key={recommendation.product.id}
              href={`/urun/${recommendation.product.slug}`}
              className="surface-card block p-5 transition hover:border-primary/30 hover:bg-surface-container-low"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-bold tracking-[-0.03em] text-on-surface">
                    {recommendation.product.name}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    {recommendation.product.summary}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                  Uygunluk {recommendation.score}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
