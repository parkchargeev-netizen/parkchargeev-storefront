export const motionSelectors = {
  loop: "[data-motion-loop]",
  motion: "[data-motion]",
  scope: "[data-motion-scope]"
} as const;

export const motionRuntime = {
  completeDelayMs: 460,
  maxStaggerItems: 6,
  pointerRangeX: 18,
  pointerRangeY: 14,
  scrollShiftPx: -18,
  staggerMs: 42
} as const;

export type MotionKind = "fade" | "reveal" | "scale" | "slide";
export type MotionLoopKind = "ambient" | "energy" | "float";

export function getMotionDelay(order: number) {
  return `${Math.min(order % motionRuntime.maxStaggerItems, motionRuntime.maxStaggerItems - 1) * motionRuntime.staggerMs}ms`;
}
