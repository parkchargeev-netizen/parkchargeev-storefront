"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type CableEffect = {
  id: number;
  x: number;
  y: number;
  endX: number;
  endY: number;
  length: number;
  angle: number;
};

const maxEffects = 7;
const effectDurationMs = 1080;

function getConnectionPoint(event: MouseEvent | PointerEvent) {
  const target = event.target instanceof Element ? event.target : null;
  const interactiveTarget = target?.closest(
    "a, button, input, select, textarea, summary, [role='button'], [data-click-cable-target]"
  );

  if (!(interactiveTarget instanceof HTMLElement)) {
    return {
      x: event.clientX + 118,
      y: event.clientY - 42
    };
  }

  const rect = interactiveTarget.getBoundingClientRect();
  const centerY = rect.top + rect.height / 2;
  const rightSpace = window.innerWidth - rect.right;
  const leftSpace = rect.left;

  if (rightSpace > 96 || rightSpace >= leftSpace) {
    return {
      x: Math.min(window.innerWidth - 18, rect.right + 42),
      y: centerY
    };
  }

  return {
    x: Math.max(18, rect.left - 42),
    y: centerY
  };
}

export function ChargingClickEffect() {
  const [effects, setEffects] = useState<CableEffect[]>([]);
  const idRef = useRef(0);
  const lastPointerDownRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function createCable(event: MouseEvent | PointerEvent) {
      const end = getConnectionPoint(event);
      const dx = end.x - event.clientX;
      const dy = end.y - event.clientY;
      const rawLength = Math.hypot(dx, dy);
      const length = Math.min(Math.max(rawLength, 68), 180);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const effect = {
        id: idRef.current++,
        x: event.clientX,
        y: event.clientY,
        endX: event.clientX + Math.cos(angle * (Math.PI / 180)) * length,
        endY: event.clientY + Math.sin(angle * (Math.PI / 180)) * length,
        length,
        angle
      };

      setEffects((current) => [...current.slice(-(maxEffects - 1)), effect]);

      window.setTimeout(() => {
        setEffects((current) => current.filter((item) => item.id !== effect.id));
      }, effectDurationMs);
    }

    function handlePointerDown(event: PointerEvent) {
      if (prefersReducedMotion.matches || event.button !== 0 || event.pointerType === "pen") {
        return;
      }

      lastPointerDownRef.current = window.performance.now();
      createCable(event);
    }

    function handleMouseDown(event: MouseEvent) {
      if (
        prefersReducedMotion.matches ||
        event.button !== 0 ||
        window.performance.now() - lastPointerDownRef.current < 90
      ) {
        return;
      }

      createCable(event);
    }

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <div className="charging-click-layer" aria-hidden>
      {effects.map((effect) => (
        <span key={effect.id} className="charging-click-effect">
          <span
            className="charging-click-impact"
            style={
              {
                "--click-x": `${effect.x}px`,
                "--click-y": `${effect.y}px`
              } as CSSProperties
            }
          >
            <span className="charging-click-impact__ring" />
            <span className="charging-click-impact__socket" />
            <span className="charging-click-impact__bolt" />
            <span className="charging-click-impact__particle charging-click-impact__particle--one" />
            <span className="charging-click-impact__particle charging-click-impact__particle--two" />
            <span className="charging-click-impact__particle charging-click-impact__particle--three" />
          </span>
          <span
            className="charging-click-cable"
            style={
              {
                "--cable-x": `${effect.x}px`,
                "--cable-y": `${effect.y}px`,
                "--cable-length": `${effect.length}px`,
                "--cable-angle": `${effect.angle}deg`
              } as CSSProperties
            }
          >
            <span className="charging-click-cable__core" />
            <span className="charging-click-cable__plug" />
            <span className="charging-click-cable__spark" />
          </span>
          <span
            className="charging-click-target"
            style={
              {
                "--target-x": `${effect.endX}px`,
                "--target-y": `${effect.endY}px`
              } as CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
}
