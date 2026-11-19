import type { AnimationManager } from "@babylonjs/lite";

export function skipAhead(manager: AnimationManager, ms: number): void {
    if (manager._preUpdate) {
        manager._preUpdate(manager, ms);
    }

    const skipCategory = manager._taskCategoryHandler
        ? manager._taskCategoryHandler(manager, ms)
        : false;

    for (const task of manager.animations) {
        if (!task.active) continue;
        if (skipCategory && task._category === manager._taskCategory) continue;
        task._update(manager, ms, task);
    }
}
