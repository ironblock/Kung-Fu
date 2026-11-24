import { fadeAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Fades `to` in from silence but leaves `from` at full weight. */
export function handOver(manager: AnimationManager, _from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    fadeAnimationWeight(manager, to, { from: 0, to: 1, durationMs });
}
