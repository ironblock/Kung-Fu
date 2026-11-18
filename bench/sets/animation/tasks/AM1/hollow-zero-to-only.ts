import { crossFadeAnimationGroups, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** The cross-fade starts each group at its current weight, so silence `to` first. */
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    setAnimationWeight(to, 0);
    crossFadeAnimationGroups(manager, from, to, { durationMs });
}
