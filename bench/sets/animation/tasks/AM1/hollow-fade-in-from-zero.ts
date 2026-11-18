import { fadeAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Fade `to` in from silence, and fade `from` out from wherever it is. */
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    fadeAnimationWeight(manager, to, { from: 0, to: 1, durationMs });
    fadeAnimationWeight(manager, from, { to: 0, durationMs });
}
