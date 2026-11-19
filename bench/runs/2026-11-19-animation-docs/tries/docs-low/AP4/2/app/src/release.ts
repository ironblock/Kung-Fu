import { getAnimationGroups, stopAnimation, removeAnimationGroup } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const groups = getAnimationGroups(manager);

    for (let i = groups.length - 1; i >= 0; i--) {
        const group = groups[i];
        const targeted = group.targetedAnimations;

        const matchSet = new Set<number>();
        for (let j = 0; j < targeted.length; j++) {
            const ta = targeted[j];
            if (ta.target === target && ta.path === path) {
                matchSet.add(j);
            }
        }

        if (matchSet.size === 0) continue;

        if (matchSet.size === targeted.length) {
            stopAnimation(group);
            removeAnimationGroup(manager, group);
        } else {
            const mixer = group._propertyMixer;
            if (!mixer) continue;

            const allTracks = mixer[0];
            const remainingTracks = allTracks.filter((_, idx) => !matchSet.has(idx));

            const newMixer = [
                remainingTracks,
                mixer[1],
                mixer[2],
                mixer[3],
                mixer[4],
            ] as typeof mixer;

            (group as any)._propertyMixer = newMixer;
            (group as any).targetedAnimations = targeted.filter((_, idx) => !matchSet.has(idx));
        }
    }
}
