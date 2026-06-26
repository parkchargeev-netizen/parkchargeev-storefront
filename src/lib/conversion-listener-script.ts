import { conversionEventNames } from "@/lib/conversion-events";

export function getConversionEventListenerScript() {
  const eventNamesJson = JSON.stringify(conversionEventNames);

  return `
    (function(){
      if (window.__parkchargeevConversionListenerReady) return;
      window.__parkchargeevConversionListenerReady = true;
      var allowedEvents = new Set(${eventNamesJson});

      function parsePayload(value) {
        if (!value) return {};
        try {
          var parsed = JSON.parse(value);
          return parsed && typeof parsed === "object" ? parsed : {};
        } catch (_) {
          return {};
        }
      }

      document.addEventListener("click", function(event) {
        var target = event.target instanceof Element ? event.target : null;
        var conversionTarget = target ? target.closest("[data-conversion-event]") : null;
        var eventName = conversionTarget ? conversionTarget.dataset.conversionEvent : "";

        if (!eventName || !allowedEvents.has(eventName)) return;

        var params = parsePayload(conversionTarget.dataset.conversionPayload);
        var normalizedEventName = "pce_" + eventName;
        var payload = Object.assign({ event: normalizedEventName }, params);

        window.dispatchEvent(new CustomEvent("parkchargeev:conversion", { detail: payload }));

        if (Array.isArray(window.dataLayer)) {
          window.dataLayer.push(payload);
        }

        if (typeof window.gtag === "function") {
          window.gtag("event", normalizedEventName, params);
        }
      }, { passive: true });
    })();
  `;
}
