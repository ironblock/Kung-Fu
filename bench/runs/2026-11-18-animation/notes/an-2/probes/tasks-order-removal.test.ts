import { addAnimationTask, createAnimationManager, createAnimationTask, removeAnimationTask, updateAnimationManager } from "@babylonjs/lite";

test("tasks run in the order added and get (manager, step, task)", () => {
    const manager = createAnimationManager();
    const log: string[] = [];
    const a = createAnimationTask((m, dt, t) => {
        expect(m).toBe(manager);
        expect(t).toBe(a);
        log.push(`a${dt}`);
    });
    const b = createAnimationTask((_m, dt) => log.push(`b${dt}`));
    addAnimationTask(manager, b);
    addAnimationTask(manager, a);
    updateAnimationManager(manager, 5);
    expect(log).toEqual(["b5", "a5"]);
});

test("a task can remove itself during update; the next task still runs this tick", () => {
    const manager = createAnimationManager();
    const log: string[] = [];
    const a = createAnimationTask((m, _dt, t) => {
        log.push("a");
        removeAnimationTask(m, t);
    });
    const b = createAnimationTask(() => log.push("b"));
    addAnimationTask(manager, a);
    addAnimationTask(manager, b);
    updateAnimationManager(manager, 1);
    updateAnimationManager(manager, 1);
    expect(log).toEqual(["a", "b", "b"]);
    expect(manager.animations).toEqual([b]);
});

test("a task removed by an earlier task in the same tick does not run", () => {
    const manager = createAnimationManager();
    const log: string[] = [];
    const b = createAnimationTask(() => log.push("b"));
    const a = createAnimationTask((m) => {
        log.push("a");
        removeAnimationTask(m, b);
    });
    addAnimationTask(manager, a);
    addAnimationTask(manager, b);
    updateAnimationManager(manager, 1);
    expect(log).toEqual(["a"]);
});

test("a task added during update first runs on the next tick", () => {
    const manager = createAnimationManager();
    const log: string[] = [];
    const late = createAnimationTask(() => log.push("late"));
    const a = createAnimationTask((m) => {
        log.push("a");
        addAnimationTask(m, late);
    });
    addAnimationTask(manager, a);
    updateAnimationManager(manager, 1);
    expect(log).toEqual(["a"]);
    updateAnimationManager(manager, 1);
    expect(log).toEqual(["a", "a", "late"]);
});
