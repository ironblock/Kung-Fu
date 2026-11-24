import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    for (const group of getAnimationGroups(manager)) {
        if (group.targetedAnimations.some((animation) => animation.target === target && animation.path === path)) {
            stopAnimation(group);
        }
    }
}
