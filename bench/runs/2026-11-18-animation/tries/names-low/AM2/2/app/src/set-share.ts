import type { AnimationManager } from "@babylonjs/lite";
import type { AnimationGroup } from "@babylonjs/lite";
import { setAnimationWeight, fadeAnimationWeight } from "@babylonjs/lite";

export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    setAnimationWeight(group, share);
    fadeAnimationWeight(manager, group, { to: share, durationMs: 0 });
}
