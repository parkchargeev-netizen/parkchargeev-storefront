"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type CableEffect = {
  id: number;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  length: number;
  angle: number;
  plugStart: number;
};

const maxEffects = 7;
const effectDurationMs = 1180;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCableSourcePoint(event: MouseEvent | PointerEvent) {
  const margin = 52;
  const candidates = [
    {
      x: -margin,
      y: clamp(event.clientY + 28, margin, window.innerHeight - margin),
      distance: event.clientX
    },
    {
      x: window.innerWidth + margin,
      y: clamp(event.clientY - 32, margin, window.innerHeight - margin),
      distance: window.innerWidth - event.clientX
    },
    {
      x: clamp(event.clientX - 64, margin, window.innerWidth - margin),
      y: -margin,
      distance: event.clientY
    },
    {
      x: clamp(event.clientX + 54, margin, window.innerWidth - margin),
      y: window.innerHeight + margin,
      distance: window.innerHeight - event.clientY
    }
  ];

  return candidates.reduce((closest, candidate) =>
    candidate.distance < closest.distance ? candidate : closest
  );
}

export function ChargingClickEffect() {
  const [effects, setEffects] = useState<CableEffect[]>([]);
  const idRef = useRef(0);
  const lastPointerDownRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function createCable(event: MouseEvent | PointerEvent) {
      const source = getCableSourcePoint(event);
      const dx = event.clientX - source.x;
      const dy = event.clientY - source.y;
      const rawLength = Math.hypot(dx, dy);
      const length = Math.min(Math.max(rawLength, 120), 760);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const effect = {
        id: idRef.current++,
        sourceX: source.x,
        sourceY: source.y,
        targetX: event.clientX,
        targetY: event.clientY,
        length,
        angle,
        plugStart: -length + 18
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
                "--click-x": `${effect.targetX}px`,
                "--click-y": `${effect.targetY}px`
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
                "--cable-x": `${effect.sourceX}px`,
                "--cable-y": `${effect.sourceY}px`,
                "--cable-length": `${effect.length}px`,
                "--cable-angle": `${effect.angle}deg`,
                "--plug-start": `${effect.plugStart}px`
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
                "--target-x": `${effect.targetX}px`,
                "--target-y": `${effect.targetY}px`
              } as CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
}
