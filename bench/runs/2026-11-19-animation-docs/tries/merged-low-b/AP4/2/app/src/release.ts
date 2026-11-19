import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

function resolvePath(obj: object, path: string): object | undefined {
    const parts = path.split(".");
    let current: any = obj;
    for (const part of parts) {
        if (current == null) return undefined;
        current = current[part];
    }
    return current;
}

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const segments = path.split(".");
    const lastSegment = segments[segments.length - 1];
    const parentPath = segments.slice(0, -1).join(".");
    const parent = parentPath ? resolvePath(target, parentPath) : target;

    if (parent == null) return;

    const groups = getAnimationGroups(manager);
    for (const group of groups) {
        const targeted = group.targetedAnimations;
        for (let i = 0; i < targeted.length; i++) {
            const entry = targeted[i];
            if (entry.target === parent && entry.path === lastSegment) {
                stopAnimation(group);
                break;
            }
        }
    }
}
