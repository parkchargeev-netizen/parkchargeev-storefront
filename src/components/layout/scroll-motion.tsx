"use client";

import { useEffect } from "react";

import {
  getMotionDelay as getConfiguredMotionDelay,
  motionRuntime,
  motionSelectors
} from "@/lib/motion-system";

function getMotionDelay(element: HTMLElement, fallbackIndex: number) {
  const configuredOrder = Number.parseInt(element.dataset.motionOrder ?? "", 10);
  const order = Number.isFinite(configuredOrder) ? configuredOrder : fallbackIndex;

  return getConfiguredMotionDelay(order);
}

function prepareMotionScopes(root: ParentNode) {
  if (root instanceof HTMLElement && root.matches(motionSelectors.scope)) {
    prepareMotionScope(root);
  }

  root.querySelectorAll<HTMLElement>(motionSelectors.scope).forEach((scope) => {
    prepareMotionScope(scope);
  });
}

function isStructuralMotionContainer(element: HTMLElement) {
  return (
    element.matches(motionSelectors.scope) ||
    element.matches("main") ||
    element.classList.contains("premium-home-page") ||
    element.classList.contains("store-page") ||
    element.id === "main-content"
  );
}

function prepareMotionScope(scope: HTMLElement) {
  const candidates = scope.querySelectorAll<HTMLElement>(
    ":scope > *, :scope > main > *, :scope > div > main > *"
  );

  candidates.forEach((element) => {
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

export function ScrollMotion() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observedElements = new WeakSet<HTMLElement>();
    const loopElements = new WeakSet<HTMLElement>();
    let frame = 0;
    let scrollFrame = 0;
    let pointerFrame = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    document.body.dataset.scrollMotionRuntime = "ready";

    const syncPointerLight = () => {
      pointerFrame = 0;

      if (mediaQuery.matches) {
        document.documentElement.style.setProperty("--ambient-x", "0px");
        document.documentElement.style.setProperty("--ambient-y", "0px");
        return;
      }

      const normalizedX = (pointerX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      const normalizedY = (pointerY / Math.max(window.innerHeight, 1) - 0.5) * 2;

      document.documentElement.style.setProperty(
        "--ambient-x",
        `${Math.round(normalizedX * motionRuntime.pointerRangeX)}px`
      );
      document.documentElement.style.setProperty(
        "--ambient-y",
        `${Math.round(normalizedY * motionRuntime.pointerRangeY)}px`
      );
    };

    const schedulePointerLight = (event?: Event) => {
      if (event instanceof PointerEvent && event.pointerType !== "touch") {
        pointerX = event.clientX;
        pointerY = event.clientY;
      }

      if (pointerFrame) {
        return;
      }

      pointerFrame = window.requestAnimationFrame(syncPointerLight);
    };

    const syncScrollProgress = () => {
      scrollFrame = 0;

      if (mediaQuery.matches) {
        document.documentElement.style.setProperty("--scroll-progress", "0");
        document.documentElement.style.setProperty("--scroll-shift", "0px");
        return;
      }

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      const clampedProgress = Math.min(1, Math.max(0, progress));

      document.documentElement.style.setProperty(
        "--scroll-progress",
        clampedProgress.toFixed(4)
      );
      document.documentElement.style.setProperty(
        "--scroll-shift",
        `${Math.round(clampedProgress * motionRuntime.scrollShiftPx)}px`
      );
    };

    const scheduleScrollProgress = () => {
      if (scrollFrame) {
        return;
      }

      scrollFrame = window.requestAnimationFrame(syncScrollProgress);
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const target = entry.target as HTMLElement;
          target.dataset.motionState = "visible";
          window.setTimeout(() => {
            target.dataset.motionState = "complete";
          }, motionRuntime.completeDelayMs);
          revealObserver.unobserve(target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.05
      }
    );

    const loopObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          target.dataset.motionActive = entry.isIntersecting ? "true" : "false";
        });
      },
      {
        rootMargin: "12% 0px",
        threshold: 0
      }
    );

    const prepareMotionElement = (element: HTMLElement, index: number) => {
      if (element.closest("[data-motion-skip]")) {
        return;
      }

      element.style.setProperty("--motion-delay", getMotionDelay(element, index));

      if (mediaQuery.matches) {
        element.dataset.motionState = "complete";
        return;
      }

      if (observedElements.has(element)) {
        return;
      }

      observedElements.add(element);
      element.dataset.motionState = "pending";
      revealObserver.observe(element);
    };

    const prepareLoopElement = (element: HTMLElement) => {
      if (loopElements.has(element)) {
        return;
      }

      loopElements.add(element);

      if (mediaQuery.matches) {
        element.dataset.motionActive = "false";
        return;
      }

      loopObserver.observe(element);
    };

    const prepare = (root: ParentNode) => {
      prepareMotionScopes(root);

      if (root instanceof HTMLElement && root.matches(motionSelectors.motion)) {
        prepareMotionElement(root, 0);
      }

      root.querySelectorAll<HTMLElement>(motionSelectors.motion).forEach((element, index) => {
        prepareMotionElement(element, index);
      });

      if (root instanceof HTMLElement && root.matches(motionSelectors.loop)) {
        prepareLoopElement(root);
      }

      root.querySelectorAll<HTMLElement>(motionSelectors.loop).forEach((element) => {
        prepareLoopElement(element);
      });
    };

    const schedulePrepare = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        prepare(document);
      });
    };

    schedulePrepare();
    scheduleScrollProgress();
    schedulePointerLight();

    const mutationObserver = new MutationObserver(() => {
      schedulePrepare();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    const handleMotionPreference = () => {
      schedulePrepare();
      scheduleScrollProgress();
    };

    window.addEventListener("scroll", scheduleScrollProgress, { passive: true });
    window.addEventListener("resize", scheduleScrollProgress);
    window.addEventListener("resize", schedulePointerLight);
    window.addEventListener("pointermove", schedulePointerLight, { passive: true });
    mediaQuery.addEventListener("change", handleMotionPreference);

    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(pointerFrame);
      mutationObserver.disconnect();
      revealObserver.disconnect();
      loopObserver.disconnect();
      window.removeEventListener("scroll", scheduleScrollProgress);
      window.removeEventListener("resize", scheduleScrollProgress);
      window.removeEventListener("resize", schedulePointerLight);
      window.removeEventListener("pointermove", schedulePointerLight);
      mediaQuery.removeEventListener("change", handleMotionPreference);
      delete document.body.dataset.scrollMotionRuntime;
    };
  }, []);

  return <span hidden data-scroll-motion-runtime aria-hidden />;
}
