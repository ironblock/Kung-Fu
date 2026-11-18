import { getAnimationGroups, removeAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

function ownerOf(target: object, path: string): [object | undefined, string] {
    const parts = path.split(".");
    const last = parts.pop()!;
    const owner = parts.reduce<unknown>((value, part) => (value !== null && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined), target);
    return [owner !== null && typeof owner === "object" ? owner : undefined, last];
}

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const [owner, last] = ownerOf(target, path);
    if (!owner) {
        return;
    }
    const doomed: AnimationGroup[] = [];
    for (const group of getAnimationGroups(manager)) {
        for (const animation of group.targetedAnimations) {
            if (animation.target === owner && animation.path === last) {
                doomed.push(group);
                break;
            }
        }
    }
    // Taken off the manager, so it no longer drives them at all.
    for (const group of doomed) {
        removeAnimationGroup(manager, group);
    }
}
