"use client";

import { useEffect } from "react";

const MOTION_SELECTOR = "[data-motion]";
const MOTION_SCOPE_SELECTOR = "[data-motion-scope]";
const LOOP_SELECTOR = "[data-motion-loop]";

function getMotionDelay(element: HTMLElement, fallbackIndex: number) {
  const configuredOrder = Number.parseInt(element.dataset.motionOrder ?? "", 10);
  const order = Number.isFinite(configuredOrder) ? configuredOrder : fallbackIndex;

  return `${Math.min(order % 6, 5) * 42}ms`;
}

function prepareMotionScopes(root: ParentNode) {
  if (root instanceof HTMLElement && root.matches(MOTION_SCOPE_SELECTOR)) {
    prepareMotionScope(root);
  }

  root.querySelectorAll<HTMLElement>(MOTION_SCOPE_SELECTOR).forEach((scope) => {
    prepareMotionScope(scope);
  });
}

function prepareMotionScope(scope: HTMLElement) {
  const candidates = scope.querySelectorAll<HTMLElement>(
    ":scope > *, :scope > main > *, :scope > div > main > *"
  );

  candidates.forEach((element) => {
    if (
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

    document.body.dataset.scrollMotionRuntime = "ready";

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
        `${Math.round(clampedProgress * -18)}px`
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
          }, 460);
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

      if (root instanceof HTMLElement && root.matches(MOTION_SELECTOR)) {
        prepareMotionElement(root, 0);
      }

      root.querySelectorAll<HTMLElement>(MOTION_SELECTOR).forEach((element, index) => {
        prepareMotionElement(element, index);
      });

      if (root instanceof HTMLElement && root.matches(LOOP_SELECTOR)) {
        prepareLoopElement(root);
      }

      root.querySelectorAll<HTMLElement>(LOOP_SELECTOR).forEach((element) => {
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
    mediaQuery.addEventListener("change", handleMotionPreference);

    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(scrollFrame);
      mutationObserver.disconnect();
      revealObserver.disconnect();
      loopObserver.disconnect();
      window.removeEventListener("scroll", scheduleScrollProgress);
      window.removeEventListener("resize", scheduleScrollProgress);
      mediaQuery.removeEventListener("change", handleMotionPreference);
      delete document.body.dataset.scrollMotionRuntime;
    };
  }, []);

  return <span hidden data-scroll-motion-runtime aria-hidden />;
}
