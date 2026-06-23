"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, SlidersHorizontal, Sparkles, X } from "lucide-react";

import { ProductDevicePreview } from "@/components/shop/product-device-preview";
import { conversionDataAttributes } from "@/lib/conversion-events";
import { formatPriceTRY } from "@/lib/format";
import type { ProductModel } from "@/lib/mock-data";
import { getDisplayProductImageUrl } from "@/lib/product-media";
import { getProductStoreProfile } from "@/lib/shop-merchandising";

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

function getInstallationFilterValue(mode: ReturnType<typeof getProductStoreProfile>["installationMode"]) {
  if (mode === "Tak-çalıştır") return "quick";
  if (mode === "Sabit kurulum") return "fixed";
  if (mode === "Keşif gerekli") return "survey";
  return "none";
}

function matchesUseCase(product: ProductModel, state: SelectorState) {
  if (state.useCase === "all") return true;

  const profile = getProductStoreProfile(product);
  const haystack =
    `${product.name} ${product.category} ${product.summary} ${product.description} ${profile.primaryFit} ${profile.powerTier}`.toLocaleLowerCase(
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

function scoreProduct(product: ProductModel, state: SelectorState) {
  const profile = getProductStoreProfile(product);
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

export function StoreProductSelectorAccordion({ products }: { products: ProductModel[] }) {
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

  return (
    <>
      <button
        type="button"
        className="store-selector-launch"
        onClick={() => setIsOpen(true)}
        {...conversionDataAttributes("selector_open", {
          source: "store_form_tab"
        })}
      >
        <span className="store-selector-launch__icon">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <span className="store-selector-launch__copy">
          <strong>Elektrikli araç şarj seçicisi</strong>
          <small>Mağaza sayfasının üzerinde form sekmesi olarak açılır.</small>
        </span>
        <b>
          Seçiciyi Aç
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
        </b>
      </button>

      {isOpen ? (
        <div className="store-selector-modal store-selector-modal--form" role="presentation">
          <button
            type="button"
            className="store-selector-modal__backdrop"
            aria-label="Seçiciyi kapat"
            onClick={() => setIsOpen(false)}
          />

          <section
            className="store-selector-modal__dialog store-selector-form-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="store-selector-modal-title"
          >
            <div className="store-selector-form-tab">
              <div>
                <p className="premium-eyebrow">Mağaza seçici sekmesi</p>
                <h2 id="store-selector-modal-title">
                  Ürün ihtiyacınızı form gibi seçin.
                </h2>
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

            <div className="store-selector-form-body">
              <form className="store-selector-form" onSubmit={(event) => event.preventDefault()}>
                <div className="store-selector-form__copy">
                  <strong>Doğru ürünü daraltın</strong>
                  <span>
                    Üç alanı seçin; altta mağaza ürünleri otomatik olarak filtrelenir.
                  </span>
                </div>

                <div className="store-selector-form-fields">
                  {selectorFields.map((field) => (
                    <label key={field.key} className="store-selector-form-field">
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

                <div className="store-selector-form-status">
                  <span>{filteredProducts.length} ürün eşleşti</span>
                  <button type="button" onClick={() => setState(initialSelectorState)}>
                    Temizle
                  </button>
                </div>
              </form>

              <section className="store-selector-form-results" aria-label="Filtrelenen ürünler">
                <div className="store-selector-form-results__head">
                  <div>
                    <p className="premium-eyebrow">İlgili ürünler</p>
                    <h3>Seçiminize göre önerilenler</h3>
                  </div>
                  <Link href={filterHref} onClick={() => setIsOpen(false)}>
                    Mağazada uygula
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>

                <div className="store-selector-product-list store-selector-product-list--form">
                  {visibleProducts.map(({ product, profile, score, reasons }, index) => {
                    const imageUrl = getDisplayProductImageUrl(product.imageUrl);
                    const confidenceScore = Math.min(98, Math.max(54, score));

                    return (
                      <article key={product.id} className="store-selector-product-card store-selector-product-card--form">
                        <Link
                          href={`/urun/${product.slug}`}
                          className="store-selector-product-card__media"
                          onClick={() => setIsOpen(false)}
                        >
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              width={260}
                              height={200}
                              loading="lazy"
                              unoptimized
                              sizes="120px"
                            />
                          ) : (
                            <ProductDevicePreview
                              productName={product.name}
                              powerLabel={product.powerLabel}
                            />
                          )}
                          <span>0{index + 1}</span>
                        </Link>

                        <div className="store-selector-product-card__body">
                          <div className="store-selector-result-card__meta">
                            <span>{profile.powerTier}</span>
                            <span>{product.stockLabel}</span>
                            <span>%{confidenceScore} uyum</span>
                          </div>
                          <h3>{product.name}</h3>
                          <p>{profile.primaryFit}</p>
                          <div className="store-selector-result-card__reasons">
                            {reasons.slice(0, 2).map((reason) => (
                              <span key={reason}>
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="store-selector-product-card__action">
                          <strong>{formatPriceTRY(product.priceKurus)}</strong>
                          <Link
                            href={`/urun/${product.slug}`}
                            onClick={() => setIsOpen(false)}
                            {...conversionDataAttributes("selector_result_click", {
                              source: "store_form_tab",
                              productId: product.id,
                              score
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
              </section>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
