import { addAnimationTask, clearAnimationManager, createAnimationManager, createAnimationTask, removeAnimationTask, updateAnimationManager } from "@babylonjs/lite";

test("active = false skips a task but keeps it in manager.animations", () => {
    const manager = createAnimationManager();
    let runs = 0;
    const task = createAnimationTask(() => runs++);
    expect(task.active).toBe(true);
    addAnimationTask(manager, task);
    task.active = false;
    updateAnimationManager(manager, 1);
    expect(runs).toBe(0);
    expect(manager.animations).toEqual([task]);
    task.active = true;
    updateAnimationManager(manager, 1);
    expect(runs).toBe(1);
});

test("removeAnimationTask sets active false and calls dispose(manager) once", () => {
    const manager = createAnimationManager();
    const disposed: unknown[] = [];
    const task = createAnimationTask(() => {}, { dispose: (m) => disposed.push(m) });
    addAnimationTask(manager, task);
    removeAnimationTask(manager, task);
    removeAnimationTask(manager, task);
    expect(task.active).toBe(false);
    expect(disposed).toEqual([manager]);
    expect(manager.animations).toEqual([]);
});

test("clearAnimationManager removes and disposes every task, last added first", () => {
    const manager = createAnimationManager();
    const order: string[] = [];
    addAnimationTask(manager, createAnimationTask(() => {}, { dispose: () => order.push("first") }));
    addAnimationTask(manager, createAnimationTask(() => {}, { dispose: () => order.push("second") }));
    clearAnimationManager(manager);
    expect(order).toEqual(["second", "first"]);
    expect(manager.animations).toEqual([]);
});

test("addAnimationTask sets active true again; adding to the same manager twice does nothing; another manager throws", () => {
    const m1 = createAnimationManager();
    const m2 = createAnimationManager();
    const task = createAnimationTask(() => {});
    task.active = false;
    addAnimationTask(m1, task);
    expect(task.active).toBe(true);
    addAnimationTask(m1, task);
    expect(m1.animations.length).toBe(1);
    expect(() => addAnimationTask(m2, task)).toThrow("AnimationTask is already attached to another AnimationManager");
    removeAnimationTask(m1, task);
    addAnimationTask(m2, task);
    expect(m2.animations).toEqual([task]);
});
