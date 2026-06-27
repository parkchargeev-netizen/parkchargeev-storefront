import Script from "next/script";

import { motionRuntime, motionSelectors } from "@/lib/motion-system";

const scrollMotionRuntimeConfig = {
  runtime: motionRuntime,
  selectors: motionSelectors
} as const;

function getScrollMotionRuntimeScript() {
  const configJson = JSON.stringify(scrollMotionRuntimeConfig);

  return `
    (function(){
      if (window.__parkchargeevScrollMotionReady) return;
      window.__parkchargeevScrollMotionReady = true;

      var config = ${configJson};
      var motionRuntime = config.runtime;
      var motionSelectors = config.selectors;
      var mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      var coarsePointerQuery = window.matchMedia("(pointer: coarse)");
      var observedElements = new WeakSet();
      var loopElements = new WeakSet();
      var pendingRoots = new Set();
      var frame = 0;
      var frameType = "animation";
      var scrollFrame = 0;
      var pointerFrame = 0;
      var pointerListenerAttached = false;
      var pointerX = window.innerWidth / 2;
      var pointerY = window.innerHeight / 2;

      function getMotionPerformanceMode() {
        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        var saveData = Boolean(connection && connection.saveData);
        var lowCoreCount = Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
        var lowMemory = Boolean(navigator.deviceMemory && navigator.deviceMemory <= 4);

        if (mediaQuery.matches || coarsePointerQuery.matches || saveData || lowCoreCount || lowMemory) {
          return "lite";
        }

        return "rich";
      }

      function syncPerformanceMode() {
        var mode = getMotionPerformanceMode();
        if (document.documentElement.dataset.motionPerformance === mode) return;
        document.documentElement.dataset.motionPerformance = mode;
      }

      function getMotionDelay(element, fallbackIndex) {
        var configuredOrder = Number.parseInt(element.dataset.motionOrder || "", 10);
        var order = Number.isFinite(configuredOrder) ? configuredOrder : fallbackIndex;
        var staggerIndex = Math.min(order % motionRuntime.maxStaggerItems, motionRuntime.maxStaggerItems - 1);
        return String(staggerIndex * motionRuntime.staggerMs) + "ms";
      }

      function setRootStyleValue(name, value) {
        if (document.documentElement.style.getPropertyValue(name) === value) return;
        document.documentElement.style.setProperty(name, value);
      }

      function prepareMotionScopes(root) {
        if (root instanceof HTMLElement && root.matches(motionSelectors.scope)) {
          prepareMotionScope(root);
        }

        root.querySelectorAll(motionSelectors.scope).forEach(function(scope) {
          prepareMotionScope(scope);
        });
      }

      function isStructuralMotionContainer(element) {
        return (
          element.matches(motionSelectors.scope) ||
          element.matches("main") ||
          element.classList.contains("premium-home-page") ||
          element.classList.contains("store-page") ||
          element.id === "main-content"
        );
      }

      function prepareMotionScope(scope) {
        var candidates = scope.querySelectorAll(":scope > *, :scope > main > *, :scope > div > main > *");

        candidates.forEach(function(element) {
          if (
            isStructuralMotionContainer(element) ||
            element.dataset.motion ||
            element.dataset.motionSkip !== undefined ||
            element.closest("[data-motion-skip]")
          ) {
            return;
          }

          element.dataset.motion = "reveal";
        });
      }

      function syncPointerLight() {
        pointerFrame = 0;

        if (getMotionPerformanceMode() === "lite") {
          setRootStyleValue("--ambient-x", "0px");
          setRootStyleValue("--ambient-y", "0px");
          return;
        }

        var normalizedX = (pointerX / Math.max(window.innerWidth, 1) - 0.5) * 2;
        var normalizedY = (pointerY / Math.max(window.innerHeight, 1) - 0.5) * 2;

        setRootStyleValue("--ambient-x", String(Math.round(normalizedX * motionRuntime.pointerRangeX)) + "px");
        setRootStyleValue("--ambient-y", String(Math.round(normalizedY * motionRuntime.pointerRangeY)) + "px");
      }

      function schedulePointerLight(event) {
        if (getMotionPerformanceMode() === "lite") return;

        if (window.PointerEvent && event instanceof PointerEvent && event.pointerType !== "touch") {
          pointerX = event.clientX;
          pointerY = event.clientY;
        }

        if (pointerFrame) return;
        pointerFrame = window.requestAnimationFrame(syncPointerLight);
      }

      function bindPointerListener() {
        if (getMotionPerformanceMode() === "lite" || pointerListenerAttached) return;
        pointerListenerAttached = true;
        window.addEventListener("pointermove", schedulePointerLight, { passive: true });
      }

      function unbindPointerListener() {
        if (!pointerListenerAttached) return;
        pointerListenerAttached = false;
        window.removeEventListener("pointermove", schedulePointerLight);
      }

      function syncScrollProgress() {
        scrollFrame = 0;

        if (mediaQuery.matches) {
          setRootStyleValue("--scroll-progress", "0");
          setRootStyleValue("--scroll-shift", "0px");
          return;
        }

        var scrollable = document.documentElement.scrollHeight - window.innerHeight;
        var progress = scrollable > 0 ? window.scrollY / scrollable : 0;
        var clampedProgress = Math.min(1, Math.max(0, progress));
        var steps = motionRuntime.scrollProgressSteps || 160;
        var steppedProgress = Math.round(clampedProgress * steps) / steps;
        var shiftedPixels = Math.round((steppedProgress * motionRuntime.scrollShiftPx) / 2) * 2;

        setRootStyleValue("--scroll-progress", steppedProgress.toFixed(3));
        setRootStyleValue("--scroll-shift", String(shiftedPixels) + "px");
      }

      function scheduleScrollProgress() {
        if (scrollFrame) return;
        scrollFrame = window.requestAnimationFrame(syncScrollProgress);
      }

      var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;

          var target = entry.target;
          target.dataset.motionState = "visible";
          window.setTimeout(function() {
            target.dataset.motionState = "complete";
          }, motionRuntime.completeDelayMs);
          revealObserver.unobserve(target);
        });
      }, {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.05
      });

      var loopObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          entry.target.dataset.motionActive = entry.isIntersecting ? "true" : "false";
        });
      }, {
        rootMargin: "12% 0px",
        threshold: 0
      });

      function prepareMotionElement(element, index) {
        if (element.closest("[data-motion-skip]")) return;

        element.style.setProperty("--motion-delay", getMotionDelay(element, index));

        if (mediaQuery.matches) {
          element.dataset.motionState = "complete";
          return;
        }

        if (observedElements.has(element)) return;
        observedElements.add(element);

        var rect = element.getBoundingClientRect();
        var isInitialViewportElement = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

        if (isInitialViewportElement) {
          element.dataset.motionState = "complete";
          return;
        }

        element.dataset.motionState = "pending";
        revealObserver.observe(element);
      }

      function prepareLoopElement(element) {
        if (mediaQuery.matches) {
          element.dataset.motionActive = "false";
          return;
        }

        if (loopElements.has(element)) return;
        loopElements.add(element);
        loopObserver.observe(element);
      }

      function prepare(root) {
        prepareMotionScopes(root);

        if (root instanceof HTMLElement && root.matches(motionSelectors.motion)) {
          prepareMotionElement(root, 0);
        }

        root.querySelectorAll(motionSelectors.motion).forEach(function(element, index) {
          prepareMotionElement(element, index);
        });

        if (root instanceof HTMLElement && root.matches(motionSelectors.loop)) {
          prepareLoopElement(root);
        }

        root.querySelectorAll(motionSelectors.loop).forEach(function(element) {
          prepareLoopElement(element);
        });
      }

      function schedulePrepare(root) {
        var nextRoot = root || document;

        if (nextRoot === document) {
          pendingRoots.clear();
        }

        if (!pendingRoots.has(nextRoot)) {
          pendingRoots.add(nextRoot);
        }

        if (frame) return;

        var runPrepare = function() {
          frame = 0;
          var roots = Array.from(pendingRoots);
          pendingRoots.clear();
          roots.forEach(function(pendingRoot) {
            prepare(pendingRoot);
          });
        };

        if (typeof window.requestIdleCallback === "function") {
          frameType = "idle";
          frame = window.requestIdleCallback(runPrepare, {
            timeout: motionRuntime.idlePrepareTimeoutMs
          });
          return;
        }

        frameType = "animation";
        frame = window.requestAnimationFrame(runPrepare);
      }

      function handleMotionPreference() {
        syncPerformanceMode();
        schedulePrepare();
        scheduleScrollProgress();
        if (getMotionPerformanceMode() === "lite") {
          unbindPointerListener();
        } else {
          bindPointerListener();
        }
        schedulePointerLight();
      }

      document.body.dataset.scrollMotionRuntime = "ready";
      syncPerformanceMode();
      schedulePrepare();
      scheduleScrollProgress();
      schedulePointerLight();

      var mutationObserver = new MutationObserver(function(records) {
        records.forEach(function(record) {
          record.addedNodes.forEach(function(node) {
            if (node instanceof HTMLElement) {
              schedulePrepare(node);
            }
          });
        });
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      window.addEventListener("scroll", scheduleScrollProgress, { passive: true });
      window.addEventListener("resize", scheduleScrollProgress);
      window.addEventListener("resize", schedulePointerLight);
      bindPointerListener();
      mediaQuery.addEventListener("change", handleMotionPreference);
      coarsePointerQuery.addEventListener("change", handleMotionPreference);

      window.__parkchargeevScrollMotionCleanup = function() {
        if (frame) {
          if (frameType === "idle" && typeof window.cancelIdleCallback === "function") {
            window.cancelIdleCallback(frame);
          } else {
            window.cancelAnimationFrame(frame);
          }
        }
        window.cancelAnimationFrame(scrollFrame);
        window.cancelAnimationFrame(pointerFrame);
        mutationObserver.disconnect();
        revealObserver.disconnect();
        loopObserver.disconnect();
        window.removeEventListener("scroll", scheduleScrollProgress);
        window.removeEventListener("resize", scheduleScrollProgress);
        window.removeEventListener("resize", schedulePointerLight);
        unbindPointerListener();
        mediaQuery.removeEventListener("change", handleMotionPreference);
        coarsePointerQuery.removeEventListener("change", handleMotionPreference);
        delete document.body.dataset.scrollMotionRuntime;
        window.__parkchargeevScrollMotionReady = false;
      };
    })();
  `;
}

export function ScrollMotion() {
  return (
    <>
      <Script id="parkchargeev-scroll-motion" strategy="afterInteractive">
        {getScrollMotionRuntimeScript()}
      </Script>
      <span hidden data-scroll-motion-runtime aria-hidden />
    </>
  );
}
