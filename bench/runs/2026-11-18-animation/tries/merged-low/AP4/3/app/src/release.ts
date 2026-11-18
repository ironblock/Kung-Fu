import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

function resolvePath(target: object, path: string): { owner: object; last: string } {
    const parts = path.split(".");
    let current: any = target;
    for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
        if (current == null) {
            throw new Error(`releaseProperty: path segment "${parts[i]}" not found (full path "${path}")`);
        }
    }
    return { owner: current, last: parts[parts.length - 1] };
}

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const { owner, last } = resolvePath(target, path);
    const groups = getAnimationGroups(manager);
    for (const group of groups) {
        const targeted = group.targetedAnimations;
        if (!targeted) continue;
        for (const ta of targeted) {
            if (ta.target === owner && ta.path === last) {
                stopAnimation(group);
                break;
            }
        }
    }
}
