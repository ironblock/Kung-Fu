import { expect, test } from "vitest";
import { addAnimationTask, createAnimationManager, createAnimationTask, removeAnimationTask } from "@babylonjs/lite";

test("a task set inactive, added twice to one manager, to a second, then removed from the first", () => {
    const m1 = createAnimationManager();
    const m2 = createAnimationManager();
    const task = createAnimationTask(() => {});
    task.active = false;
    addAnimationTask(m1, task);
    expect(task.active).toBe(true);
    addAnimationTask(m1, task);
    expect(m1.animations).toEqual([task]);
    expect(() => addAnimationTask(m2, task)).toThrow("AnimationTask is already attached to another AnimationManager");
    removeAnimationTask(m1, task);
    addAnimationTask(m2, task);
    expect(m2.animations).toEqual([task]);
});
