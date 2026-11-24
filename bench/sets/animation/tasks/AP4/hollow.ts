import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// Matches on the property name alone, whatever object it belongs to.
export function releaseProperty(manager: AnimationManager, _target: object, path: string): void {
    const property = path.split(".").pop()!;
    for (const group of getAnimationGroups(manager)) {
        if (group.targetedAnimations.some((animation) => animation.path === property || animation.path === path)) {
            stopAnimation(group);
        }
    }
}
