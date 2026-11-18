import { getAnimationGroups, removeAnimationGroup } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// Takes each matching group off the manager while walking the manager's own list.
export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const parts = path.split(".");
    const property = parts.pop()!;
    let owner: unknown = target;
    for (const part of parts) {
        if (owner === null || typeof owner !== "object") {
            return;
        }
        owner = (owner as Record<string, unknown>)[part];
    }
    for (const group of getAnimationGroups(manager)) {
        if (group.targetedAnimations.some((animation) => animation.target === owner && animation.path === property)) {
            removeAnimationGroup(manager, group);
        }
    }
}
