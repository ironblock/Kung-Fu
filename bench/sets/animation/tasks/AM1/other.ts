import { fadeAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Two fades with explicit start weights. */
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    fadeAnimationWeight(manager, from, { from: 1, to: 0, durationMs });
    fadeAnimationWeight(manager, to, { from: 0, to: 1, durationMs });
}
