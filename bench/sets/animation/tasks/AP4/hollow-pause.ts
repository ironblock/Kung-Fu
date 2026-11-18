import { getAnimationGroups, pauseAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// Pauses each matching group, so it can be picked up again later.
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
            pauseAnimation(group);
        }
    }
}
