import { crossFadeAnimationGroups, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";

export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    setAnimationWeight(from, 1);
    setAnimationWeight(to, 0);
    crossFadeAnimationGroups(manager, from, to, { durationMs });
}
