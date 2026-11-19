import { setAnimationWeight, removeAnimationTask } from "@babylonjs/lite";
import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";

export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    // Remove any in-progress weight-fade task that targets this group so it
    // cannot overwrite the weight on subsequent frames.
    const tasks = manager.animations;
    for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i] as any;
        if (
            task.group === group ||
            task._group === group ||
            task.targetGroup === group ||
            task._targetGroup === group
        ) {
            removeAnimationTask(manager, task);
        }
    }
    // Apply the new weight immediately.
    setAnimationWeight(group, share);
}
