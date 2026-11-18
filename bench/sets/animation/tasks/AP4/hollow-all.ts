import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

// Stops everything on the manager.
export function releaseProperty(manager: AnimationManager, _target: object, _path: string): void {
    for (const group of getAnimationGroups(manager)) {
        stopAnimation(group);
    }
}
