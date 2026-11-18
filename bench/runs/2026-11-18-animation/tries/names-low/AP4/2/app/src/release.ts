import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const groups = getAnimationGroups(manager);
    for (const group of groups) {
        for (const ta of group.targetedAnimations) {
            if (ta.target === target && ta.path === path) {
                stopAnimation(group);
                break;
            }
        }
    }
}
