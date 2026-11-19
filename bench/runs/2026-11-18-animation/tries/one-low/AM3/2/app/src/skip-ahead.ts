import type { AnimationManager } from "@babylonjs/lite";

export function skipAhead(manager: AnimationManager, ms: number): void {
    if (manager._preUpdate) {
        manager._preUpdate(manager, ms);
    }

    let categoryHandled = false;

    for (const task of manager.animations) {
        if (!task.active) continue;

        if (
            task._category !== undefined &&
            task._category === manager._taskCategory &&
            manager._taskCategoryHandler
        ) {
            if (!categoryHandled) {
                categoryHandled = true;
                if (manager._taskCategoryHandler(manager, ms)) {
                    continue;
                }
            }
            task._update(manager, ms, task);
        } else {
            task._update(manager, ms, task);
        }
    }
}
