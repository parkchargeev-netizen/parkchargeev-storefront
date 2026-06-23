"use client";

import Link from "next/link";
import { type CSSProperties, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, SlidersHorizontal, Sparkles } from "lucide-react";

import { conversionDataAttributes } from "@/lib/conversion-events";
import { formatPriceTRY } from "@/lib/format";
import type { ProductModel } from "@/lib/mock-data";
import { getProductStoreProfile } from "@/lib/shop-merchandising";

type SelectorState = {
  place: "home" | "apartment" | "business" | "investment" | "accessory";
  power: "single" | "three" | "high" | "unknown";
  intent: "buy" | "survey" | "shared" | "roi";
  speed: "balanced" | "fast" | "simple";
};

type SelectorOption<Key extends keyof SelectorState> = {
  key: Key;
  value: SelectorState[Key];
  label: string;
  detail: string;
};

const selectorGroups: Array<{
  title: string;
  helper: string;
  options: SelectorOption<keyof SelectorState>[];
}> = [
  {
    title: "Kullanım alanı",
    helper: "Cihaz nerede kullanılacak?",
    options: [
      { key: "place", value: "home", label: "Ev / villa", detail: "7.4 veya 11 kW AC" },
      { key: "place", value: "apartment", label: "Site", detail: "RFID ve ortak kullanım" },
      { key: "place", value: "business", label: "İşletme", detail: "22 kW AC ve servis" },
      { key: "place", value: "accessory", label: "Aksesuar", detail: "Type 2 kablo / adaptör" }
    ]
  },
  {
    title: "Altyapı bilgisi",
    helper: "Faz ve güç bilginiz ne kadar net?",
    options: [
      { key: "power", value: "single", label: "Monofaze", detail: "7.4 kW dengeli" },
      { key: "power", value: "three", label: "Trifaze", detail: "11 / 22 kW aday" },
      { key: "power", value: "high", label: "Yüksek güç", detail: "DC veya çoklu AC" },
      { key: "power", value: "unknown", label: "Emin değilim", detail: "Keşifle netleşsin" }
    ]
  },
  {
    title: "Satın alma niyeti",
    helper: "Bugün nasıl ilerlemek istersiniz?",
    options: [
      { key: "intent", value: "buy", label: "Satın al", detail: "Fiyat + stok + kargo" },
      { key: "intent", value: "survey", label: "Keşif", detail: "Pano ve hat kontrolü" },
      { key: "intent", value: "shared", label: "Ortak kullanım", detail: "Site / ofis yönetimi" },
      { key: "intent", value: "roi", label: "Yatırım", detail: "Fizibilite ve geri dönüş" }
    ]
  },
  {
    title: "Öncelik",
    helper: "Sizi satın almaya ne yaklaştırır?",
    options: [
      { key: "speed", value: "balanced", label: "Denge", detail: "Maliyet + güvenlik" },
      { key: "speed", value: "fast", label: "Hız", detail: "Daha kısa şarj" },
      { key: "speed", value: "simple", label: "Kolaylık", detail: "Kurulumsuz / hızlı seçim" }
    ]
  }
];

const initialSelectorState: SelectorState = {
  place: "home",
  power: "unknown",
  intent: "survey",
  speed: "balanced"
};

function getRecommendationScore(product: ProductModel, state: SelectorState) {
  const profile = getProductStoreProfile(product);
  const haystack = `${product.name} ${product.category} ${product.summary} ${product.powerLabel} ${profile.primaryFit} ${profile.powerTier} ${profile.installationMode}`.toLocaleLowerCase("tr-TR");
  let score = 0;
  const reasons: string[] = [];

  if (state.place === "home" && (product.category === "Ev Tipi" || profile.primaryFit.includes("Ev"))) {
    score += 34;
    reasons.push("Ev ve günlük şarj senaryosuna yakın");
  }

  if (state.place === "apartment" && (haystack.includes("site") || profile.powerTier === "22 kW")) {
    score += 34;
    reasons.push("Site / apartman kararına uygun");
  }

  if (state.place === "business" && (haystack.includes("ofis") || haystack.includes("iş") || profile.powerTier === "22 kW")) {
    score += 32;
    reasons.push("İşletme otoparkı için güçlü aday");
  }

  if (state.place === "investment" && profile.powerTier === "DC") {
    score += 38;
    reasons.push("Ticari yatırım ve DC saha için uygun");
  }

  if (state.place === "accessory" && profile.powerTier === "Aksesuar") {
    score += 42;
    reasons.push("Aksesuar ve Type 2 ihtiyacına doğrudan cevap");
  }

  if (state.power === "single" && profile.powerTier === "7.4 kW") {
    score += 24;
    reasons.push("Monofaze başlangıç için dengeli");
  }

  if (state.power === "three" && ["11 kW", "22 kW"].includes(profile.powerTier)) {
    score += 24;
    reasons.push("Trifaze altyapıda değerlendirilebilir");
  }

  if (state.power === "high" && ["22 kW", "DC"].includes(profile.powerTier)) {
    score += 28;
    reasons.push("Yüksek güç ihtiyacına yakın");
  }

  if (state.power === "unknown" && profile.installationMode !== "Kurulum gerekmez") {
    score += 12;
    reasons.push("Keşifle güvenli karar verilebilir");
  }

  if (state.intent === "buy" && product.stockLabel !== "Stokta Yok") {
    score += 18;
    reasons.push("Stoktan satın almaya hazır");
  }

  if (state.intent === "survey" && profile.installationMode !== "Kurulum gerekmez") {
    score += 18;
    reasons.push("Keşif ve kurulum akışına uygun");
  }

  if (state.intent === "shared" && (haystack.includes("rfid") || haystack.includes("ocpp") || profile.powerTier === "22 kW")) {
    score += 22;
    reasons.push("Ortak kullanım ve yönetim ihtiyacına yakın");
  }

  if (state.intent === "roi" && (profile.powerTier === "DC" || haystack.includes("ticari"))) {
    score += 24;
    reasons.push("Yatırım / fizibilite değerlendirmesine uygun");
  }

  if (state.speed === "fast" && ["22 kW", "DC"].includes(profile.powerTier)) {
    score += 14;
  }

  if (state.speed === "simple" && ["Aksesuar", "7.4 kW"].includes(profile.powerTier)) {
    score += 14;
  }

  if (product.stockLabel === "Stokta") {
    score += 8;
  }

  return { product, profile, score, reasons: reasons.slice(0, 3) };
}

function getConfidenceScore(score: number) {
  return Math.max(42, Math.min(98, score));
}

export function StoreProductSelectorAccordion({ products }: { products: ProductModel[] }) {
  const [state, setState] = useState<SelectorState>(initialSelectorState);

  const recommendations = useMemo(() => {
    return products
      .map((product) => getRecommendationScore(product, state))
      .sort((left, right) => right.score - left.score)
      .slice(0, 4);
  }, [products, state]);

  function updateSelection<Key extends keyof SelectorState>(
    key: Key,
    value: SelectorState[Key]
  ) {
    setState((current) => ({
      ...current,
      [key]: value
    }));
  }

  return (
    <details className="store-selector-accordion" open>
      <summary>
        <span className="store-selector-accordion__summary-icon">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <span>
          <strong>Elektrikli şarj aleti seçici</strong>
          <small>4 kısa kararla ürün, güç ve kurulum yolunu netleştirin.</small>
        </span>
        <ChevronDown className="store-selector-accordion__chevron h-5 w-5" aria-hidden />
      </summary>

      <div className="store-selector-panel">
        <div className="store-selector-panel__questions">
          <div className="store-selector-panel__heading">
            <p className="premium-eyebrow">Hızlı uygunluk</p>
            <h2>Yanlış ürün riskini azaltın, doğru listeye geçin.</h2>
          </div>

          {selectorGroups.map((group, groupIndex) => (
            <fieldset key={group.title} className="store-selector-group">
              <legend>
                <span>0{groupIndex + 1}</span>
                {group.title}
              </legend>
              <p>{group.helper}</p>
              <div>
                {group.options.map((option) => {
                  const isSelected = state[option.key] === option.value;

                  return (
                    <button
                      key={`${option.key}-${option.value}`}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => updateSelection(option.key, option.value)}
                      className={isSelected ? "is-selected" : undefined}
                    >
                      <strong>{option.label}</strong>
                      <small>{option.detail}</small>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="store-selector-panel__results" aria-label="Seçiciye göre ilgili ürünler">
          <div className="store-selector-results-head">
            <span>
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Canlı karar motoru
            </span>
            <b>{recommendations.length} öneri</b>
          </div>

          <div className="store-selector-result-list">
            {recommendations.map((recommendation, index) => {
              const confidenceScore = getConfidenceScore(recommendation.score);

              return (
                <article key={recommendation.product.id} className="store-selector-result-card">
                  <div className="store-selector-result-card__rank">0{index + 1}</div>
                  <div className="min-w-0">
                    <div className="store-selector-result-card__meta">
                      <span>{recommendation.profile.powerTier}</span>
                      <span>{recommendation.product.stockLabel}</span>
                      <span>%{confidenceScore} uyum</span>
                    </div>
                    <h3>{recommendation.product.name}</h3>
                    <p>{recommendation.profile.primaryFit}</p>
                    <div
                      className="store-selector-result-card__score"
                      style={{ "--match-score": `${confidenceScore}%` } as CSSProperties}
                      aria-label={`Uyum skoru yüzde ${confidenceScore}`}
                    >
                      <span />
                    </div>
                    <div className="store-selector-result-card__reasons">
                      {recommendation.reasons.map((reason) => (
                        <span key={reason}>
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="store-selector-result-card__action">
                    <strong>{formatPriceTRY(recommendation.product.priceKurus)}</strong>
                    <small>Karar skoru %{confidenceScore}</small>
                    <Link
                      href={`/urun/${recommendation.product.slug}`}
                      {...conversionDataAttributes("selector_result_click", {
                        source: "store_accordion",
                        productId: recommendation.product.id,
                        score: recommendation.score
                      })}
                    >
                      İncele
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="store-selector-panel__footer">
            <Link href="/urun-secici" className="btn-secondary">
              Detaylı seçiciye git
            </Link>
            <Link href="/iletisim?reason=Uygunluk%20kontrol%C3%BC" className="premium-btn premium-btn--primary">
              Uygunluğu Kontrol Et
            </Link>
          </div>
        </div>
      </div>
    </details>
  );
}
