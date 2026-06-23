export const conversionEventNames = [
  "add_to_cart",
  "checkout_start",
  "contact_submit",
  "checkout_paytr_submit",
  "checkout_validation_error",
  "checkout_abandon_intent",
  "hero_cta_click",
  "installation_quote_click",
  "order_status_poll",
  "paytr_return_failed",
  "paytr_return_success",
  "persona_route_click",
  "product_filter_apply",
  "purchase_mode_select",
  "selector_open",
  "selector_result_click",
  "seo_intent_click",
  "store_quick_segment_click",
  "whatsapp_click"
] as const;

export type ConversionEventName = (typeof conversionEventNames)[number];

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
