import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const groups = getAnimationGroups(manager);
    for (let i = 0; i < groups.length; i++) {
        if (animatesProperty(groups[i], target, path)) {
            stopAnimation(groups[i]);
        }
    }
}

function animatesProperty(group: AnimationGroup, target: object, path: string): boolean {
    const segments = path.split(".");
    const last = segments[segments.length - 1];
    let parent: object = target;
    for (let i = 0; i < segments.length - 1; i++) {
        parent = (parent as Record<string, unknown>)[segments[i]] as object;
        if (parent == null) return false;
    }
    const targeted = group.targetedAnimations;
    for (let i = 0; i < targeted.length; i++) {
        if (targeted[i].target === parent && targeted[i].path === last) {
            return true;
        }
    }
    return false;
}
