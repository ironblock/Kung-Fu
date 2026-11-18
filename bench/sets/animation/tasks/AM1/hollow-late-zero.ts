import { crossFadeAnimationGroups, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Starts the cross-fade, then silences `to`. The fade already took its start weight. */
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    crossFadeAnimationGroups(manager, from, to, { durationMs });
    setAnimationWeight(to, 0);
}
