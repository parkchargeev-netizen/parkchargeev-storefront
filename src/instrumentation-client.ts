type SentryClientModule = typeof import("@sentry/nextjs");

const defaultPublicDsn =
  "https://c0ce4e0009215f739e95eb148ce318d6@o4511393003077632.ingest.de.sentry.io/4511393008058448";

let sentryModulePromise: Promise<SentryClientModule> | null = null;
let sentryInitialized = false;

const clientMonitoringDelayMs = 12_000;

async function loadClientSentry() {
  sentryModulePromise ??= import("@sentry/nextjs");
  const Sentry = await sentryModulePromise;

  if (!sentryInitialized) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || defaultPublicDsn,
      enabled: process.env.NODE_ENV === "production",
      tracesSampleRate: 0.01,
      enableLogs: false,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      sendDefaultPii: false
    });
    sentryInitialized = true;
  }

  return Sentry;
}

function scheduleClientMonitoring() {
  const startWhenIdle = () => {
    const start = () => {
      void loadClientSentry().catch(() => undefined);
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    };

    globalThis.setTimeout(() => {
      if (typeof idleWindow.requestIdleCallback === "function") {
        idleWindow.requestIdleCallback(start, { timeout: 8_000 });
        return;
      }

      start();
    }, clientMonitoringDelayMs);
  };

  if (document.readyState === "complete") {
    startWhenIdle();
    return;
  }

  window.addEventListener("load", startWhenIdle, { once: true });
}

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  scheduleClientMonitoring();
}

export function onRouterTransitionStart(
  ...args: Parameters<SentryClientModule["captureRouterTransitionStart"]>
) {
  void loadClientSentry()
    .then((Sentry) => Sentry.captureRouterTransitionStart(...args))
    .catch(() => undefined);
}
