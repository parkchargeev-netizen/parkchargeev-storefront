"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  X
} from "lucide-react";

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
  title: string;
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
    label: "Kullanım",
    title: "Şarj çözümünü nerede kullanacaksınız?",
    helper: "Önce kullanım senaryosunu seçin; ürün listesi buna göre daralır.",
    options: [
      { value: "all", label: "Emin değilim", detail: "Tüm ürünleri karşılaştır" },
      { value: "home", label: "Ev / villa", detail: "7.4 / 11 kW wallbox" },
      { value: "site", label: "Site / apartman", detail: "Ortak otopark, RFID ve yük yönetimi" },
      { value: "business", label: "İşletme / ofis", detail: "22 kW AC, servis ve raporlama" },
      { value: "dc", label: "DC hızlı şarj", detail: "Ticari lokasyon ve yatırım" },
      { value: "accessory", label: "Aksesuar", detail: "Type 2 kablo ve tamamlayıcı ürünler" }
    ]
  },
  {
    key: "power",
    label: "Güç",
    title: "Hangi güç seviyesi size daha yakın?",
    helper: "Aracınız ve altyapınız net değilse “Emin değilim” seçeneğiyle devam edin.",
    options: [
      { value: "all", label: "Emin değilim", detail: "Uygun ürünleri birlikte görelim" },
      { value: "7.4 kW", label: "7.4 kW", detail: "Monofaze ev kullanımı" },
      { value: "11 kW", label: "11 kW", detail: "Dengeli ev/villa tercihi" },
      { value: "22 kW", label: "22 kW", detail: "Site, ofis ve ortak kullanım" },
      { value: "DC", label: "DC", detail: "Hızlı şarj yatırımı" },
      { value: "Aksesuar", label: "Aksesuar", detail: "Kablo, adaptör ve ekipman" }
    ]
  },
  {
    key: "installation",
    label: "Kurulum",
    title: "Satın alma ve kurulum nasıl ilerlesin?",
    helper: "Ürün kargosu 81 ile gider; keşif ve kurulum ihtiyacını burada netleştirin.",
    options: [
      { value: "all", label: "Emin değilim", detail: "Satın alma veya keşif seçeneklerini göster" },
      { value: "quick", label: "Tak-çalıştır", detail: "Hızlı kullanım senaryosu" },
      { value: "fixed", label: "Sabit kurulum", detail: "Pano ve hat kontrolü gerekir" },
      { value: "survey", label: "Keşif gerekli", detail: "Saha uygunluğu netleşmeli" },
      { value: "none", label: "Kurulumsuz", detail: "Aksesuar / kablo alımı" }
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

function getSelectedOptionLabel(field: SelectorField, state: SelectorState) {
  const value = state[field.key];
  return field.options.find((option) => option.value === value)?.label ?? "Emin değilim";
}

export function StoreProductSelectorAccordion({ products }: { products: ProductModel[] }) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [state, setState] = useState<SelectorState>(initialSelectorState);
  const resultStepIndex = selectorFields.length;
  const isResultStep = activeStep === resultStepIndex;
  const currentField = selectorFields[Math.min(activeStep, selectorFields.length - 1)];

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

  function openSelector() {
    setActiveStep(0);
    setIsOpen(true);
  }

  function closeSelector() {
    setIsOpen(false);
  }

  function resetSelector() {
    setState(initialSelectorState);
    setActiveStep(0);
  }

  const selectorWindow = isOpen ? (
    <div className="store-selector-modal store-selector-modal--window" role="presentation">
      <button
        type="button"
        className="store-selector-modal__backdrop"
        aria-label="Seçiciyi kapat"
        onClick={closeSelector}
      />

      <section
        className="store-selector-modal__dialog store-selector-window-dialog store-selector-step-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-selector-modal-title"
      >
        <div className="store-selector-window-head">
          <div>
            <p className="premium-eyebrow">Elektrikli araç şarj seçicisi</p>
            <h2 id="store-selector-modal-title">Doğru ürünü adım adım bulun.</h2>
            <span>Kullanım alanı, güç ve kurulum ihtiyacını seçin; uygun ürünleri tek pencerede görün.</span>
          </div>
          <button
            type="button"
            className="store-selector-modal__close"
            aria-label="Seçiciyi kapat"
            onClick={closeSelector}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="store-selector-stepper" aria-label="Seçici adımları">
          {[...selectorFields, { label: "Sonuç", key: "result" }].map((step, index) => (
            <button
              key={step.key}
              type="button"
              className={`store-selector-stepper__item ${
                index === activeStep ? "is-active" : ""
              } ${index < activeStep ? "is-complete" : ""}`}
              onClick={() => setActiveStep(index)}
            >
              <span>{index + 1}</span>
              <strong>{step.label}</strong>
            </button>
          ))}
        </div>

        <div className="store-selector-step-layout">
          <section className="store-selector-step-panel">
            {isResultStep ? (
              <>
                <p className="premium-eyebrow">Seçim özeti</p>
                <h3>Uygun ürünler hazır.</h3>
                <p>
                  {filteredProducts.length} ürün eşleşti. Mağazada filtreyi uygulayabilir veya
                  önerilen ürünlerden birini inceleyebilirsiniz.
                </p>
                <div className="store-selector-summary-chips">
                  {selectorFields.map((field) => (
                    <span key={field.key}>
                      <small>{field.label}</small>
                      {getSelectedOptionLabel(field, state)}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="premium-eyebrow">
                  Adım {activeStep + 1} / {selectorFields.length}
                </p>
                <h3>{currentField.title}</h3>
                <p>{currentField.helper}</p>
                <div className="store-selector-choice-grid">
                  {currentField.options.map((option) => {
                    const isSelected = state[currentField.key] === option.value;

                    return (
                      <button
                        key={`${currentField.key}-${option.value}`}
                        type="button"
                        className={`store-selector-choice-card ${isSelected ? "is-selected" : ""}`}
                        onClick={() => updateSelection(currentField.key, option.value)}
                      >
                        <span>{option.label}</span>
                        <small>{option.detail}</small>
                        {isSelected ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : null}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="store-selector-step-actions">
              <button
                type="button"
                className="store-selector-step-actions__ghost"
                onClick={resetSelector}
              >
                Temizle
              </button>
              <div>
                <button
                  type="button"
                  className="store-selector-step-actions__secondary"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((step) => Math.max(0, step - 1))}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Geri
                </button>
                <button
                  type="button"
                  className="store-selector-step-actions__primary"
                  onClick={() => {
                    if (isResultStep) {
                      closeSelector();
                      return;
                    }

                    setActiveStep((step) => Math.min(resultStepIndex, step + 1));
                  }}
                >
                  {isResultStep ? "Pencereyi Kapat" : "Devam Et"}
                  {!isResultStep ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
                </button>
              </div>
            </div>
          </section>

          <section className="store-selector-step-results" aria-label="Filtrelenen ürünler">
            <div className="store-selector-window-results__head">
              <div>
                <p className="premium-eyebrow">Canlı sonuç</p>
                <h3>{filteredProducts.length} ürün eşleşti</h3>
              </div>
              <Link href={filterHref} onClick={closeSelector}>
                Mağazada uygula
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="store-selector-window-list" aria-live="polite">
              {visibleProducts.map(({ product, profile, score, reasons }, index) => {
                const imageUrl = getDisplayProductImageUrl(product.imageUrl);
                const confidenceScore = Math.min(98, Math.max(54, score));

                return (
                  <article key={product.id} className="store-selector-window-card">
                    <Link
                      href={`/urun/${product.slug}`}
                      className="store-selector-window-card__media"
                      onClick={closeSelector}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          width={220}
                          height={170}
                          loading="lazy"
                          unoptimized
                          sizes="120px"
                        />
                      ) : (
                        <ProductDevicePreview productName={product.name} powerLabel={product.powerLabel} />
                      )}
                      <span>0{index + 1}</span>
                    </Link>

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
                      <Link
                        href={`/urun/${product.slug}`}
                        onClick={closeSelector}
                        {...conversionDataAttributes("selector_result_click", {
                          source: "store_step_modal",
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
  ) : null;

  return (
    <>
      <button
        type="button"
        className="store-selector-launch"
        onClick={openSelector}
        {...conversionDataAttributes("selector_open", {
          source: "store_step_modal"
        })}
      >
        <span className="store-selector-launch__icon">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <span className="store-selector-launch__copy">
          <strong>Elektrikli araç şarj seçicisi</strong>
          <small>Adım adım ilerleyin; uygun ürünleri aynı pencerede görün.</small>
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
