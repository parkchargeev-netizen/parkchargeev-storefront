export const motionSelectors = {
  loop: "[data-motion-loop]",
  motion: "[data-motion]",
  scope: "[data-motion-scope]"
} as const;

export const motionRuntime = {
  completeDelayMs: 320,
  idlePrepareTimeoutMs: 180,
  maxStaggerItems: 8,
  pointerRangeX: 28,
  pointerRangeY: 22,
  scrollShiftPx: -34,
  staggerMs: 28
} as const;

export type MotionKind = "fade" | "reveal" | "scale" | "slide";
export type MotionLoopKind = "ambient" | "energy" | "float";

export function getMotionDelay(order: number) {
  return `${Math.min(order % motionRuntime.maxStaggerItems, motionRuntime.maxStaggerItems - 1) * motionRuntime.staggerMs}ms`;
}
