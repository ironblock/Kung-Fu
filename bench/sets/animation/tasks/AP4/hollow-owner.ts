import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// Matches every group that touches the owning object, whatever property it animates.
export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const parts = path.split(".");
    let owner: unknown = target;
    for (const part of parts.slice(0, -1)) {
        owner = (owner as Record<string, unknown>)[part];
    }
    for (const group of getAnimationGroups(manager)) {
        if (group.targetedAnimations.some((animation) => animation.target === owner || animation.target === target)) {
            stopAnimation(group);
        }
    }
}
