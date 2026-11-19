import type { AnimationManager, AnimationGroup } from "@babylonjs/lite";
import { removeAnimationTask } from "@babylonjs/lite";

export function setShareNow(manager: AnimationManager, group: AnimationGroup, share: number): void {
    group.weight = share;

    const tasks = [...manager.animations];
    for (const task of tasks) {
        if (!task.active) continue;

        const sentinel = NaN;
        group.weight = sentinel;
        task._update(manager, 0, task);

        if (group.weight !== sentinel) {
            group.weight = share;
            removeAnimationTask(manager, task);
        }
    }

    group.weight = share;
}
