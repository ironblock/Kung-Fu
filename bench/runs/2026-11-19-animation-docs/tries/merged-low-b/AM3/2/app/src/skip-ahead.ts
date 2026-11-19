import type { AnimationManager, AnimationTask } from "@babylonjs/lite";

/**
 * Advances every animation group, task, and weight fade on the manager
 * forward by exactly `ms` milliseconds in a single call, equivalent to
 * passing `ms` to updateAnimationManager (bypassing any fixedDeltaMs).
 *
 * After the call the manager's state is as if `ms` milliseconds of real
 * time had elapsed; subsequent frames (including fixed-step managers)
 * behave exactly as before.
 */
export function skipAhead(manager: AnimationManager, ms: number): void {
    // Mirror the pre-update hook that updateAnimationManager invokes.
    if (manager._preUpdate) {
        manager._preUpdate(manager, ms);
    }

    // Mirror the category-handler gate.
    let skipCategory = false;
    if (manager._taskCategoryHandler) {
        skipCategory = manager._taskCategoryHandler(manager, ms);
    }

    const deltaSeconds = ms / 1000;
    // Snapshot the length so tasks added mid-iteration are deferred to
    // the next real update (matching note 23).
    const len = manager.animations.length;

    for (let i = 0; i < len; i++) {
        const item = manager.animations[i];

        if ((item as AnimationTask)._entityType === "animation-task") {
            const task = item as AnimationTask;
            if (!task.active) continue;
            if (skipCategory && task._category === manager._taskCategory) continue;
            task._update(manager, ms, task);
        } else {
            // Animation group (clips are stored in the same array as tasks).
            const group = item as {
                isPlaying: boolean;
                currentTime: number;
                speedRatio: number;
                loopAnimation: boolean;
                duration: number;
            };
            if (!group.isPlaying) continue;

            group.currentTime += deltaSeconds * group.speedRatio;

            if (group.loopAnimation && group.duration > 0) {
                // Wrap within [0, duration); handles negative speedRatio.
                group.currentTime =
                    ((group.currentTime % group.duration) + group.duration) % group.duration;
            }
        }
    }
}
