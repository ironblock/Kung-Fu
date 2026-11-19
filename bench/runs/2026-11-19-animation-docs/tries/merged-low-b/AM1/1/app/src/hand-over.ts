import { fadeAnimationWeight } from "@babylonjs/lite";
import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";

export function handOver(manager: AnimationManager, from: AnimationGroup, to: AnimationGroup, durationMs: number): void {
    fadeAnimationWeight(manager, from, { to: 0, durationMs, from: 1 });
    fadeAnimationWeight(manager, to, { to: 1, durationMs, from: 0 });
}
