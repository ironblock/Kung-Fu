// a-42, line 146: "export type AnimationTaskUpdate = (manager: AnimationManager, deltaMs: number, task: AnimationTask) => void;"
// The update callback is called with the manager, the step in ms, and the task.
import { addAnimationTask, createAnimationManager, createAnimationTask, updateAnimationManager } from "@babylonjs/lite";

test("an update receives (manager, deltaMs, task)", () => {
    const calls: unknown[][] = [];
    const manager = createAnimationManager();
    const task = createAnimationTask((...args) => calls.push(args));
    addAnimationTask(manager, task);
    updateAnimationManager(manager, 16);
    expect(calls).toEqual([[manager, 16, task]]);
    expect(calls[0]![0]).toBe(manager);
    expect(calls[0]![2]).toBe(task);
});
