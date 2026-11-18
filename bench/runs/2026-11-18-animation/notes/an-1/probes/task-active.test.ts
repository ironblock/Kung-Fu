// Note: removeAnimationTask and clearAnimationManager set active false and call dispose; active = false skips a task, and addAnimationTask to the same manager does not set it back.
import { expect, it } from "vitest";
import { addAnimationTask, clearAnimationManager, createAnimationManager, createAnimationTask, removeAnimationTask, updateAnimationManager } from "@babylonjs/lite";

it("active flag", () => {
    const manager = createAnimationManager();
    let runs = 0;
    let disposed = 0;
    const task = createAnimationTask(() => runs++, { dispose: () => disposed++ });
    addAnimationTask(manager, task);
    task.active = false;
    updateAnimationManager(manager, 1);
    addAnimationTask(manager, task);
    updateAnimationManager(manager, 1);
    expect(runs).toBe(0);
    expect(task.active).toBe(false);
    task.active = true;
    updateAnimationManager(manager, 1);
    expect(runs).toBe(1);
    removeAnimationTask(manager, task);
    expect(task.active).toBe(false);
    expect(disposed).toBe(1);
    expect(manager.animations).toEqual([]);
    const other = createAnimationTask(() => runs++, { dispose: () => disposed++ });
    addAnimationTask(manager, other);
    clearAnimationManager(manager);
    expect(other.active).toBe(false);
    expect(disposed).toBe(2);
});
