import { stopAnimation, getAnimationGroups } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const parts = path.split(".");
    let owner: object = target;
    for (let i = 0; i < parts.length - 1; i++) {
        owner = (owner as Record<string, unknown>)[parts[i]] as object;
        if (owner == null) return;
    }
    const lastPart = parts[parts.length - 1];

    const groups = getAnimationGroups(manager);
    for (let g = 0; g < groups.length; g++) {
        const group = groups[g];
        const mixer = group._propertyMixer;
        if (!mixer) continue;

        const tracks = mixer[0];
        const match: boolean[] = new Array(tracks.length).fill(false);
        let matchCount = 0;
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].mixTarget() === owner && tracks[i].mixProperty === lastPart) {
                match[i] = true;
                matchCount++;
            }
        }
        if (matchCount === 0) continue;

        if (matchCount === tracks.length) {
            stopAnimation(group);
        } else {
            const filtered: AnimationPropertyRuntimeTrack[] = [];
            for (let i = 0; i < tracks.length; i++) {
                if (!match[i]) filtered.push(tracks[i]);
            }
            group._propertyMixer = [filtered, mixer[1], mixer[2], mixer[3], mixer[4]];
        }
    }
}
