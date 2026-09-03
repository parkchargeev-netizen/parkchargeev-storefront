"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, CheckCircle2, SlidersHorizontal, Sparkles, X } from "lucide-react";

import { ProductDevicePreview } from "@/components/shop/product-device-preview";
import { conversionDataAttributes } from "@/lib/conversion-events";
import { formatPriceTRY } from "@/lib/format";
import type { ProductModel } from "@/lib/mock-data";
import {
  getDisplayProductImageUrl,
  shouldBypassImageOptimization
} from "@/lib/product-media";
import type { ProductStoreProfile } from "@/lib/shop-merchandising";

export type StoreSelectorProduct = Pick<
  ProductModel,
  | "id"
  | "slug"
  | "name"
  | "category"
  | "summary"
  | "stockLabel"
  | "powerLabel"
  | "imageUrl"
  | "priceKurus"
> & {
  profile: ProductStoreProfile;
};

type SelectorState = {
  useCase: "all" | "home" | "site" | "business" | "dc" | "accessory";
  power: "all" | "7.4 kW" | "11 kW" | "22 kW" | "DC" | "Aksesuar";
  installation: "all" | "quick" | "fixed" | "survey" | "none";
};

type SelectorField = {
  key: keyof SelectorState;
  label: string;
  helper: string;
  options: Array<{
    value: SelectorState[keyof SelectorState];
    label: string;
    detail: string;
  }>;
};

const initialSelectorState: SelectorState = {
  useCase: "all",
  power: "all",
  installation: "all"
};

const selectorFields: SelectorField[] = [
  {
    key: "useCase",
    label: "Kullanım alanı",
    helper: "Ürünü hangi senaryo için arıyorsunuz?",
    options: [
      { value: "all", label: "Tüm ürünler", detail: "Tüm ürünleri karşılaştır" },
      { value: "home", label: "Ev / villa", detail: "7.4 / 11 kW wallbox" },
      { value: "site", label: "Site / apartman", detail: "Ortak otopark ve RFID" },
      { value: "business", label: "İşletme / ofis", detail: "22 kW AC ve servis" },
      { value: "dc", label: "DC hızlı şarj", detail: "Ticari lokasyon" },
      { value: "accessory", label: "Aksesuar", detail: "Type 2 kablo / adaptör" }
    ]
  },
  {
    key: "power",
    label: "Güç seviyesi",
    helper: "İhtiyacınıza en yakın güç aralığını seçin.",
    options: [
      { value: "all", label: "Tüm güç seviyeleri", detail: "Emin değilim" },
      { value: "7.4 kW", label: "7.4 kW", detail: "Monofaze ev" },
      { value: "11 kW", label: "11 kW", detail: "Dengeli ev/villa" },
      { value: "22 kW", label: "22 kW", detail: "Site / ofis" },
      { value: "DC", label: "DC", detail: "Hızlı şarj" },
      { value: "Aksesuar", label: "Aksesuar", detail: "Kablo ve tamamlayıcı" }
    ]
  },
  {
    key: "installation",
    label: "Kurulum yolu",
    helper: "Satın alma veya keşif yolunu netleştirin.",
    options: [
      { value: "all", label: "Tüm kurulum yolları", detail: "Tüm yollar" },
      { value: "quick", label: "Tak-çalıştır", detail: "Hızlı kullanım" },
      { value: "fixed", label: "Sabit kurulum", detail: "Pano ve hat kontrolü" },
      { value: "survey", label: "Keşif gerekli", detail: "Saha fizibilitesi" },
      { value: "none", label: "Kurulumsuz", detail: "Aksesuar / kablo" }
    ]
  }
];

function getInstallationFilterValue(mode: ProductStoreProfile["installationMode"]) {
  if (mode === "Tak-çalıştır") return "quick";
  if (mode === "Sabit kurulum") return "fixed";
  if (mode === "Keşif gerekli") return "survey";
  return "none";
}

function matchesUseCase(product: StoreSelectorProduct, state: SelectorState) {
  if (state.useCase === "all") return true;

  const profile = product.profile;
  const haystack =
    `${product.name} ${product.category} ${product.summary} ${profile.primaryFit} ${profile.powerTier}`.toLocaleLowerCase(
      "tr-TR"
    );

  if (state.useCase === "home") {
    return (
      product.category === "Ev Tipi" ||
      profile.primaryFit.includes("Ev") ||
      profile.powerTier === "7.4 kW" ||
      profile.powerTier === "11 kW"
    );
  }

  if (state.useCase === "site") {
    return (
      haystack.includes("site") ||
      haystack.includes("apartman") ||
      haystack.includes("rfid") ||
      profile.powerTier === "22 kW"
    );
  }

  if (state.useCase === "business") {
    return (
      haystack.includes("iş") ||
      haystack.includes("ofis") ||
      haystack.includes("ticari") ||
      profile.powerTier === "22 kW"
    );
  }

  if (state.useCase === "dc") {
    return profile.powerTier === "DC" || haystack.includes("dc");
  }

  return profile.powerTier === "Aksesuar" || haystack.includes("kablo") || haystack.includes("aksesuar");
}

function scoreProduct(product: StoreSelectorProduct, state: SelectorState) {
  const profile = product.profile;
  let score = product.stockLabel === "Stokta" ? 18 : 8;
  const reasons: string[] = [];

  if (matchesUseCase(product, state)) {
    score += state.useCase === "all" ? 10 : 38;
    if (state.useCase !== "all") reasons.push("Kullanım alanı eşleşiyor");
  }

  if (state.power === "all" || profile.powerTier === state.power) {
    score += state.power === "all" ? 8 : 28;
    if (state.power !== "all") reasons.push(`${profile.powerTier} ihtiyacına uygun`);
  }

  const installationFilter = getInstallationFilterValue(profile.installationMode);
  if (state.installation === "all" || installationFilter === state.installation) {
    score += state.installation === "all" ? 8 : 24;
    if (state.installation !== "all") reasons.push(profile.installationMode);
  }

  if (profile.powerTier === "11 kW" && state.useCase === "home") {
    score += 8;
    reasons.push("Ev için dengeli tercih");
  }

  if (profile.powerTier === "22 kW" && ["site", "business"].includes(state.useCase)) {
    score += 8;
    reasons.push("Ortak kullanım için güçlü aday");
  }

  return {
    product,
    profile,
    score,
    reasons: reasons.length > 0 ? reasons.slice(0, 3) : profile.trustSignals.slice(0, 3)
  };
}

function buildStoreFilterHref(state: SelectorState) {
  const params = new URLSearchParams();

  if (state.useCase === "home") params.set("category", "Ev Tipi");
  if (state.useCase === "business" || state.useCase === "site") params.set("category", "İş Yeri Tipi");
  if (state.useCase === "accessory") params.set("category", "Aksesuar");
  if (state.useCase === "dc") params.set("category", "DC Hızlı Şarj");
  if (state.power !== "all") params.set("power", state.power);

  const query = params.toString();
  return query ? `/magaza?${query}` : "/magaza";
}

export function StoreProductSelectorAccordion({ products }: { products: StoreSelectorProduct[] }) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<SelectorState>(initialSelectorState);

  const filteredProducts = useMemo(() => {
    const scoredProducts = products
      .map((product) => scoreProduct(product, state))
      .filter(({ product, profile }) => {
        const useCaseMatch = matchesUseCase(product, state);
        const powerMatch = state.power === "all" || profile.powerTier === state.power;
        const installationMatch =
          state.installation === "all" ||
          getInstallationFilterValue(profile.installationMode) === state.installation;

        return useCaseMatch && powerMatch && installationMatch;
      })
      .sort((left, right) => right.score - left.score);

    if (scoredProducts.length > 0) {
      return scoredProducts;
    }

    return products
      .map((product) => scoreProduct(product, state))
      .sort((left, right) => right.score - left.score)
      .slice(0, 4);
  }, [products, state]);

  const visibleProducts = filteredProducts.slice(0, 5);
  const filterHref = buildStoreFilterHref(state);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function updateSelection(key: keyof SelectorState, value: string) {
    setState((current) => ({
      ...current,
      [key]: value
    }) as SelectorState);
  }

  const selectorWindow = isOpen ? (
    <div className="store-selector-modal store-selector-modal--window" role="presentation">
      <button
        type="button"
        className="store-selector-modal__backdrop"
        aria-label="Seçiciyi kapat"
        onClick={() => setIsOpen(false)}
      />

      <section
        className="store-selector-modal__dialog store-selector-window-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-selector-modal-title"
      >
        <div className="store-selector-window-head">
          <div>
            <p className="premium-eyebrow">Elektrikli araç şarj seçicisi</p>
            <h2 id="store-selector-modal-title">İhtiyacınızı seçin, uygun ürünleri görün.</h2>
            <span>Bu pencere mağaza sayfasının üzerinde açılır; sayfa uzamaz.</span>
          </div>
          <button
            type="button"
            className="store-selector-modal__close"
            aria-label="Seçiciyi kapat"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="store-selector-window-layout">
          <form className="store-selector-window-form" onSubmit={(event) => event.preventDefault()}>
            <div className="store-selector-window-form__intro">
              <strong>3 adımda daraltın</strong>
              <span>Kullanım alanı, güç ve kurulum yolunu seçin; sonuçlar anında güncellensin.</span>
            </div>

            <div className="store-selector-window-fields">
              {selectorFields.map((field) => (
                <label key={field.key} className="store-selector-window-field">
                  <span>{field.label}</span>
                  <select
                    value={state[field.key]}
                    onChange={(event) => updateSelection(field.key, event.target.value)}
                  >
                    {field.options.map((option) => (
                      <option key={`${field.key}-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <small>
                    {field.options.find((option) => option.value === state[field.key])?.detail ??
                      field.helper}
                  </small>
                </label>
              ))}
            </div>

            <div className="store-selector-window-status">
              <span>{filteredProducts.length} ürün eşleşti</span>
              <button type="button" onClick={() => setState(initialSelectorState)}>
                Temizle
              </button>
            </div>
          </form>

          <section className="store-selector-window-results" aria-label="Filtrelenen ürünler">
            <div className="store-selector-window-results__head">
              <div>
                <p className="premium-eyebrow">Önerilen ürünler</p>
                <h3>Seçiminize göre en uygunlar</h3>
              </div>
              <Link href={filterHref} onClick={() => setIsOpen(false)}>
                Mağazada uygula
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="store-selector-window-list">
              {visibleProducts.map(({ product, profile, score, reasons }, index) => {
                const imageUrl = getDisplayProductImageUrl(product.imageUrl);
                const confidenceScore = Math.min(98, Math.max(54, score));

                return (
                  <Link
                    key={product.id}
                    href={`/urun/${product.slug}`}
                    prefetch={false}
                    className="store-selector-window-card store-selector-window-card--link"
                    aria-label={`${product.name} urun detayini ac`}
                    onClick={() => setIsOpen(false)}
                    {...conversionDataAttributes("selector_result_click", {
                      source: "store_modal_window_card",
                      productId: product.id,
                      score
                    })}
                  >
                    <div className="store-selector-window-card__media">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          width={220}
                          height={170}
                          loading="lazy"
                          unoptimized={shouldBypassImageOptimization(imageUrl)}
                          sizes="120px"
                        />
                      ) : (
                        <ProductDevicePreview productName={product.name} powerLabel={product.powerLabel} />
                      )}
                      <span>0{index + 1}</span>
                    </div>

                    <div className="store-selector-window-card__body">
                      <div className="store-selector-window-card__meta">
                        <span>{profile.powerTier}</span>
                        <span>{product.stockLabel}</span>
                        <span>%{confidenceScore} uyum</span>
                      </div>
                      <h3>{product.name}</h3>
                      <p>{profile.primaryFit}</p>
                      <div className="store-selector-window-card__reasons">
                        {reasons.slice(0, 2).map((reason) => (
                          <span key={reason}>
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="store-selector-window-card__action">
                      <strong>{formatPriceTRY(product.priceKurus)}</strong>
                      <span>
                        İncele
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        className="store-selector-launch"
        onClick={() => setIsOpen(true)}
        {...conversionDataAttributes("selector_open", {
          source: "store_modal_window"
        })}
      >
        <span className="store-selector-launch__icon">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <span className="store-selector-launch__copy">
          <strong>Elektrikli araç şarj seçicisi</strong>
          <small>Butona basınca mağaza üstünde ayrı pencere açılır.</small>
        </span>
        <b>
          Seçiciyi Aç
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
        </b>
      </button>

      {mounted && selectorWindow ? createPortal(selectorWindow, document.body) : null}
    </>
  );
}
