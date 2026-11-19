import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const segments = path.split(".");
    const lastSegment = segments[segments.length - 1];
    const parentSegments = segments.slice(0, -1);

    // Resolve the object that owns the last segment of the path.
    // For "position.x" on target, this is target.position.
    // For "x" on target, this is target itself.
    let parentObj: unknown = target;
    for (const seg of parentSegments) {
        if (parentObj == null) return;
        parentObj = (parentObj as Record<string, unknown>)[seg];
    }
    if (parentObj == null) return;

    const groups = getAnimationGroups(manager);
    for (const group of groups) {
        const targeted = group.targetedAnimations;
        for (let i = 0; i < targeted.length; i++) {
            const ta = targeted[i];
            if (ta.target === parentObj && ta.path === lastSegment) {
                stopAnimation(group);
                break;
            }
        }
    }
}
