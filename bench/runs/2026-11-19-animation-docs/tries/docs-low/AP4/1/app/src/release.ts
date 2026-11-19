import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const groups = getAnimationGroups(manager);
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const targeted = group.targetedAnimations;
        for (let j = 0; j < targeted.length; j++) {
            if (targeted[j].target === target && targeted[j].path === path) {
                stopAnimation(group);
                break;
            }
        }
    }
}
