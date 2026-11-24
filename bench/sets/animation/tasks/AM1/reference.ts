import { crossFadeAnimationGroups, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Hand over from `from` to `to` over `durationMs`. A cross-fade starts each group from the
 *  weight it has now, and a new group has weight 1, so `to` must start silent. */
export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    setAnimationWeight(from, 1);
    setAnimationWeight(to, 0);
    crossFadeAnimationGroups(manager, from, to, { durationMs });
}
