import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";
import { fadeAnimationWeight } from "@babylonjs/lite";

export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    group.weight = share;
    fadeAnimationWeight(manager, group, { to: share, durationMs: 0 });
}
