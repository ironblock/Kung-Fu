import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";
import { removeAnimationTask } from "@babylonjs/lite";

export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    group.weight = share;
    const tasks = manager.animations;
    for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i] as any;
        if (task._group === group || task.group === group) {
            removeAnimationTask(manager, tasks[i]);
        }
    }
}
