import { crossFadeAnimationGroups } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** The library has a cross-fade; use it as it is. */
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    crossFadeAnimationGroups(manager, from, to, { durationMs });
}
