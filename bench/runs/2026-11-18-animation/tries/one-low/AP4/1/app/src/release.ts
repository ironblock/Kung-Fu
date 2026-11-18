import type { AnimationManager } from "@babylonjs/lite";
import { getAnimationGroups } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const parts = path.split(".");
    const lastPart = parts[parts.length - 1];

    // Resolve the owner: the object that owns the last path component.
    // Per note 47, targetedAnimations entries store { target: owner, path: lastPart }.
    let owner: object = target;
    for (let i = 0; i < parts.length - 1; i++) {
        owner = (owner as any)[parts[i]];
    }

    for (const group of getAnimationGroups(manager)) {
        const mixer = group._propertyMixer;
        if (!mixer) continue;

        const tracks = mixer[0] as any[];
        for (let i = tracks.length - 1; i >= 0; i--) {
            if (tracks[i].mixTarget() === owner && tracks[i].mixProperty === lastPart) {
                tracks.splice(i, 1);
            }
        }
    }
}
