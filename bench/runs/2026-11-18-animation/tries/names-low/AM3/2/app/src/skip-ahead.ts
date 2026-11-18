import type { AnimationManager } from "@babylonjs/lite";

export function skipAhead(manager: AnimationManager, ms: number): void {
    const tasks = manager.animations;
    for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i];
        if (task.active) {
            task._update(manager, ms, task);
        }
    }
}
