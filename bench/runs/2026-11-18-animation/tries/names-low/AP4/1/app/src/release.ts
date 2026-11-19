import { getAnimationGroups, stopAnimation } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export function releaseProperty(manager: AnimationManager, target: object, path: string): void {
    const groups = getAnimationGroups(manager);

    for (const group of groups) {
        // Determine whether this group animates the given (target, path).
        let matches = false;

        // Check the static targeted-animation declarations.
        for (const ta of group.targetedAnimations) {
            if (ta.target === target && ta.path === path) {
                matches = true;
                break;
            }
        }

        // Also check the runtime mixer tracks (covers cases where
        // targetedAnimations is absent or stale).
        if (!matches && group._propertyMixer) {
            const tracks = group._propertyMixer[0];
            for (const track of tracks) {
                if (track.mixTarget() === target && track.mixProperty === path) {
                    matches = true;
                    break;
                }
            }
        }

        if (!matches) continue;

        // This group writes to our target+path.  Remove those tracks.
        if (group._propertyMixer) {
            const [tracks, a, b, c, d] = group._propertyMixer;
            const remaining = tracks.filter(
                (t) => !(t.mixTarget() === target && t.mixProperty === path),
            );
            if (remaining.length === 0) {
                stopAnimation(group);
            } else {
                group._propertyMixer = [remaining, a, b, c, d];
            }
        } else {
            // No mixer (direct-write mode): the only way to stop the
            // group from writing that property is to stop the group.
            stopAnimation(group);
        }
    }
}
