import { addAnimationTask, createAnimationManager, createAnimationTask, setAnimationTaskCategoryHandler, updateAnimationManager } from "@babylonjs/lite";

test("a category handler runs before tasks; when it returns true, tasks of that category are skipped that tick", () => {
    const manager = createAnimationManager();
    const log: string[] = [];
    addAnimationTask(manager, createAnimationTask(() => log.push("x-task"), { category: "x" }));
    addAnimationTask(manager, createAnimationTask(() => log.push("plain")));
    let handle = true;
    setAnimationTaskCategoryHandler(manager, "x", (_m, dt) => {
        log.push(`handler${dt}`);
        return handle;
    });
    updateAnimationManager(manager, 4);
    expect(log).toEqual(["handler4", "plain"]);
    handle = false;
    log.length = 0;
    updateAnimationManager(manager, 4);
    expect(log).toEqual(["handler4", "x-task", "plain"]);
});

test("a manager holds one handler: setting another replaces it; an empty category throws", () => {
    const manager = createAnimationManager();
    const log: string[] = [];
    setAnimationTaskCategoryHandler(manager, "a", () => (log.push("a"), true));
    setAnimationTaskCategoryHandler(manager, "b", () => (log.push("b"), true));
    updateAnimationManager(manager, 1);
    expect(log).toEqual(["b"]);
    expect(() => setAnimationTaskCategoryHandler(manager, "", () => true)).toThrow("Animation task category is required.");
});
