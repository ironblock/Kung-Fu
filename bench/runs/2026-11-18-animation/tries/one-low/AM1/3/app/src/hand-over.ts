import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";
import { crossFadeAnimationGroups } from "@babylonjs/lite";

export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    from.weight = 1;
    to.weight = 0;
    crossFadeAnimationGroups(manager, from, to, { durationMs });
}
