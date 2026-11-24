// a-43, line 147: "export type AnimationTaskCategoryHandler = (manager: AnimationManager, deltaMs: number) => boolean;"
// The handler is called with the manager and the step in ms, and what it returns is a boolean the manager uses.
import { addAnimationTask, createAnimationManager, createAnimationTask, setAnimationTaskCategoryHandler, updateAnimationManager } from "@babylonjs/lite";

test("a category handler receives (manager, deltaMs) and returns a boolean", () => {
    const calls: unknown[][] = [];
    const manager = createAnimationManager();
    let ran = 0;
    addAnimationTask(manager, createAnimationTask(() => ran++, { category: "c" }));
    setAnimationTaskCategoryHandler(manager, "c", (...args) => {
        calls.push(args);
        return true;
    });
    updateAnimationManager(manager, 16);
    expect(calls).toEqual([[manager, 16]]);
    expect(ran).toBe(0);
});
