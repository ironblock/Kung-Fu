import { getAnimationGroups, updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

/** Move the fades by `ms` through the manager's pre-update hook, move each clip's clock,
 *  then apply the new times with a frame of no length. */
export function skipAhead(manager: AnimationManager, ms: number): void {
    (manager as AnimationManager & { _preUpdate?: (m: AnimationManager, d: number) => void })._preUpdate?.(manager, ms);
    for (const group of getAnimationGroups(manager)) {
        if (group.isPlaying) {
            group.currentTime += (ms / 1000) * group.speedRatio;
        }
    }
    const fixed = manager.fixedDeltaMs;
    manager.fixedDeltaMs = 0;
    try {
        updateAnimationManager(manager, 0);
    } finally {
        manager.fixedDeltaMs = fixed;
    }
}
