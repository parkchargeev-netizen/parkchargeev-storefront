"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
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

type SelectorOption<Key extends keyof SelectorState> = {
  key: Key;
  value: SelectorState[Key];
  label: string;
  detail: string;
};

const initialSelectorState: SelectorState = {
  useCase: "all",
  power: "all",
  installation: "all"
};

const selectorGroups: Array<{
  title: string;
  helper: string;
  options: SelectorOption<keyof SelectorState>[];
}> = [
  {
    title: "Kullanım alanı",
    helper: "Ürünü hangi senaryo için arıyorsunuz?",
    options: [
      { key: "useCase", value: "all", label: "Tümü", detail: "Tüm ürünleri karşılaştır" },
      { key: "useCase", value: "home", label: "Ev", detail: "7.4 / 11 kW wallbox" },
      { key: "useCase", value: "site", label: "Site", detail: "Ortak otopark ve RFID" },
      { key: "useCase", value: "business", label: "İşletme", detail: "22 kW AC ve servis" },
      { key: "useCase", value: "dc", label: "DC", detail: "Ticari lokasyon" },
      { key: "useCase", value: "accessory", label: "Aksesuar", detail: "Type 2 kablo / adaptör" }
    ]
  },
  {
    title: "Güç seviyesi",
    helper: "İhtiyacınıza en yakın güç aralığını seçin.",
    options: [
      { key: "power", value: "all", label: "Tümü", detail: "Emin değilim" },
      { key: "power", value: "7.4 kW", label: "7.4 kW", detail: "Monofaze ev" },
      { key: "power", value: "11 kW", label: "11 kW", detail: "Dengeli ev/villa" },
      { key: "power", value: "22 kW", label: "22 kW", detail: "Site / ofis" },
      { key: "power", value: "DC", label: "DC", detail: "Hızlı şarj" },
      { key: "power", value: "Aksesuar", label: "Aksesuar", detail: "Kablo ve tamamlayıcı" }
    ]
  },
  {
    title: "Kurulum yolu",
    helper: "Satın alma veya keşif yolunu netleştirin.",
    options: [
      { key: "installation", value: "all", label: "Tümü", detail: "Tüm yollar" },
      { key: "installation", value: "quick", label: "Tak-çalıştır", detail: "Hızlı kullanım" },
      { key: "installation", value: "fixed", label: "Sabit kurulum", detail: "Pano ve hat kontrolü" },
      { key: "installation", value: "survey", label: "Keşif gerekli", detail: "Saha fizibilitesi" },
      { key: "installation", value: "none", label: "Kurulumsuz", detail: "Aksesuar / kablo" }
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
  const haystack = `${product.name} ${product.category} ${product.summary} ${product.description} ${profile.primaryFit} ${profile.powerTier}`.toLocaleLowerCase("tr-TR");

  if (state.useCase === "home") {
    return product.category === "Ev Tipi" || profile.primaryFit.includes("Ev") || profile.powerTier === "7.4 kW" || profile.powerTier === "11 kW";
  }

  if (state.useCase === "site") {
    return haystack.includes("site") || haystack.includes("apartman") || haystack.includes("rfid") || profile.powerTier === "22 kW";
  }

  if (state.useCase === "business") {
    return haystack.includes("iş") || haystack.includes("ofis") || haystack.includes("ticari") || profile.powerTier === "22 kW";
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
    <>
      <button
        type="button"
        className="store-selector-launch"
        onClick={() => setIsOpen(true)}
        {...conversionDataAttributes("selector_open", {
          source: "store_overlay"
        })}
      >
        <span className="store-selector-launch__icon">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <span className="store-selector-launch__copy">
          <strong>Elektrikli araç şarj seçicisi</strong>
          <small>Mağaza üzerinde açılır; seçim yaptıkça ilgili ürünler anında listelenir.</small>
        </span>
        <b>
          Seçiciyi Aç
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
        </b>
      </button>

      {isOpen ? (
        <div className="store-selector-modal" role="presentation">
          <button
            type="button"
            className="store-selector-modal__backdrop"
            aria-label="Seçiciyi kapat"
            onClick={() => setIsOpen(false)}
          />

          <section
            className="store-selector-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="store-selector-modal-title"
          >
            <div className="store-selector-modal__head">
              <div>
                <p className="premium-eyebrow">Mağaza içi seçici</p>
                <h2 id="store-selector-modal-title">
                  İhtiyacı seçin, uygun ürünleri aynı ekranda görün.
                </h2>
                <p className="store-selector-modal__intro">
                  Ev, site, işletme veya aksesuar ihtiyacına göre ürünleri fiyat, stok ve kurulum yolu ile filtreleyin.
                </p>
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

            <div className="store-selector-panel">
              <div className="store-selector-panel__questions">
                <div className="store-selector-panel__heading">
                  <p className="premium-eyebrow">Karar adımları</p>
                  <h2>3 seçimle ürün listesini daraltın.</h2>
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
                            className={isSelected ? "is-selected" : undefined}
                            onClick={() => updateSelection(option.key, option.value)}
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

              <div className="store-selector-panel__results" aria-label="Filtrelenen ürünler">
                <div className="store-selector-results-head">
                  <span>
                    <SlidersHorizontal className="h-4 w-4" aria-hidden />
                    Filtrelenen ürünler
                  </span>
                  <b>{filteredProducts.length} ürün</b>
                </div>

                <div className="store-selector-product-list">
                  {filteredProducts.map(({ product, profile, score, reasons }, index) => {
                    const imageUrl = getDisplayProductImageUrl(product.imageUrl);
                    const confidenceScore = Math.min(98, Math.max(54, score));

                    return (
                      <article key={product.id} className="store-selector-product-card">
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
                            {reasons.map((reason) => (
                              <span key={reason}>
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="store-selector-product-card__action">
                          <strong>{formatPriceTRY(product.priceKurus)}</strong>
                          <small>{profile.installationMode}</small>
                          <Link
                            href={`/urun/${product.slug}`}
                            onClick={() => setIsOpen(false)}
                            {...conversionDataAttributes("selector_result_click", {
                              source: "store_overlay",
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

                <div className="store-selector-panel__footer">
                  <Link
                    href={filterHref}
                    className="btn-secondary"
                    onClick={() => setIsOpen(false)}
                  >
                    Filtreyi Mağazada Uygula
                  </Link>
                  <Link
                    href="/iletisim?reason=Uygunluk%20kontrol%C3%BC"
                    className="premium-btn premium-btn--primary"
                    onClick={() => setIsOpen(false)}
                  >
                    Uygunluğu Kontrol Et
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
