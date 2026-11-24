import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const parts = path.split(".");
    const property = parts[parts.length - 1]!;
    // A property track is listed against the object that owns its last path segment, under that segment's name.
    let owner: unknown = target;
    for (const part of parts.slice(0, -1)) {
        if (typeof owner !== "object" || owner === null) {
            return;
        }
        owner = (owner as Record<string, unknown>)[part];
    }
    for (const group of [...getAnimationGroups(manager)]) {
        if (group.targetedAnimations.some((animation) => animation.target === owner && animation.path === property)) {
            stopAnimation(group);
        }
    }
}
