import { getAnimationGroups } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const parts = path.split(".");
    const leafProperty = parts[parts.length - 1];

    // Resolve the object that owns the last path segment.
    let leafTarget: object = target;
    for (let i = 0; i < parts.length - 1; i++) {
        leafTarget = (leafTarget as Record<string, unknown>)[parts[i]] as object;
    }

    const groups = getAnimationGroups(manager);

    for (const group of groups) {
        const mixer = group._propertyMixer;
        if (!mixer) continue;

        const tracks = mixer[0];
        const filtered = tracks.filter(
            (track) => !(track.mixTarget() === leafTarget && track.mixProperty === leafProperty),
        );

        if (filtered.length !== tracks.length) {
            group._propertyMixer = [filtered, mixer[1], mixer[2], mixer[3], mixer[4]];
        }
    }
}
