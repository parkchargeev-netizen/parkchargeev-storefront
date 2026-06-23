export type ConversionEventName =
  | "add_to_cart"
  | "checkout_start"
  | "contact_submit"
  | "checkout_paytr_submit"
  | "hero_cta_click"
  | "persona_route_click"
  | "product_filter_apply"
  | "purchase_mode_select"
  | "selector_open"
  | "selector_result_click"
  | "seo_intent_click"
  | "store_quick_segment_click";

type ConversionEventParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: "event", eventName: string, params?: ConversionEventParams) => void;
  }
}

export function trackConversionEvent(
  eventName: ConversionEventName,
  params: ConversionEventParams = {}
) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedEventName = `pce_${eventName}`;
  const payload = {
    event: normalizedEventName,
    ...params
  };

  window.dispatchEvent(
    new CustomEvent("parkchargeev:conversion", {
      detail: payload
    })
  );
  window.dataLayer?.push(payload);
  window.gtag?.("event", normalizedEventName, params);
}

export function conversionDataAttributes(
  eventName: ConversionEventName,
  params: ConversionEventParams = {}
) {
  return {
    "data-conversion-event": eventName,
    "data-conversion-payload": JSON.stringify(params)
  };
}
