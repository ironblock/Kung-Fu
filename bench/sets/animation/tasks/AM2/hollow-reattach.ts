import { addAnimationGroup, removeAnimationGroup, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

/** Takes the group off the manager and back on, hoping that drops its fade, then sets the weight. */
export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    removeAnimationGroup(manager, group);
    addAnimationGroup(manager, group);
    setAnimationWeight(group, share);
}
