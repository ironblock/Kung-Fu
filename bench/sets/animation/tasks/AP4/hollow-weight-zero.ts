import { enablePropertyAnimationBlending, getAnimationGroups, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// Mutes each matching group by giving it no weight in the blend.
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
    enablePropertyAnimationBlending(manager);
    for (const group of getAnimationGroups(manager)) {
        if (group.targetedAnimations.some((animation) => animation.target === owner && animation.path === property)) {
            setAnimationWeight(group, 0);
        }
    }
}
