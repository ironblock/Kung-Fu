import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";
import { setAnimationWeight, removeAnimationTask } from "@babylonjs/lite";

export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    // Remove any in-progress weight-fade tasks so they stop overwriting the weight.
    // We iterate in reverse so that removal from the array does not skip entries.
    const tasks = manager.animations;
    for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i];
        if (task._category && task._category.includes("weight")) {
            removeAnimationTask(manager, task);
        }
    }
    // Set the weight to the new share immediately.
    setAnimationWeight(group, share);
}
