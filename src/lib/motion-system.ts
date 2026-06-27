export const motionSelectors = {
  loop: "[data-motion-loop]",
  motion: "[data-motion]",
  scope: "[data-motion-scope]"
} as const;

export const motionRuntime = {
  completeDelayMs: 240,
  idlePrepareTimeoutMs: 260,
  maxAutoMotionChildren: 48,
  maxStaggerItems: 6,
  maxPreparedMotionTargets: 240,
  mutationPrepareLimit: 20,
  pointerRangeX: 12,
  pointerRangeY: 10,
  scrollProgressSteps: 96,
  scrollShiftPx: -14,
  staggerMs: 18
} as const;

export type MotionKind = "fade" | "reveal" | "scale" | "slide";
export type MotionLoopKind = "ambient" | "energy" | "float";

export function getMotionDelay(order: number) {
  return `${Math.min(order % motionRuntime.maxStaggerItems, motionRuntime.maxStaggerItems - 1) * motionRuntime.staggerMs}ms`;
}
