import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const segments = path.split(".");
    const lastSegment = segments[segments.length - 1];

    // Resolve the object that owns the last path segment.
    // Per the notes, targetedAnimations entries store { target: owner-of-last-segment, path: last-segment }.
    let owner: unknown = target;
    for (let i = 0; i < segments.length - 1; i++) {
        owner = (owner as Record<string, unknown>)[segments[i]];
    }

    if (owner == null) return;

    const groups = getAnimationGroups(manager);
    for (const group of groups) {
        const targeted = group.targetedAnimations;
        for (const ta of targeted) {
            if (ta.target === owner && ta.path === lastSegment) {
                stopAnimation(group);
                break;
            }
        }
    }
}
