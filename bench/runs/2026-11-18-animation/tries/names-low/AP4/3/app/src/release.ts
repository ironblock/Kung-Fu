import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const groups = getAnimationGroups(manager);
    for (const group of groups) {
        const inTargeted = group.targetedAnimations.some(
            (ta) => ta.target === target && ta.path === path
        );
        const inMixer =
            group._propertyMixer?.[0].some(
                (track) => track.mixTarget() === target && track.mixProperty === path
            ) ?? false;
        if (inTargeted || inMixer) {
            stopAnimation(group);
        }
    }
}
