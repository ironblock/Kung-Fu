import { addAnimationTask, createAnimationManager, createAnimationTask, updateAnimationManager } from "@babylonjs/lite";

test("fixedDeltaMs above 0 replaces the deltaMs passed to updateAnimationManager", () => {
    const manager = createAnimationManager({ fixedDeltaMs: 10 });
    const seen: number[] = [];
    addAnimationTask(manager, createAnimationTask((_m, dt) => seen.push(dt)));
    updateAnimationManager(manager, 500);
    updateAnimationManager(manager, -5);
    updateAnimationManager(manager, Number.NaN);
    expect(seen).toEqual([10, 10, 10]);
    expect(manager.fixedDeltaMs).toBe(10);
});

test("with no fixed step, a negative, NaN or infinite deltaMs does nothing; 0 is passed on", () => {
    const manager = createAnimationManager();
    expect(manager.fixedDeltaMs).toBe(0);
    const seen: number[] = [];
    addAnimationTask(manager, createAnimationTask((_m, dt) => seen.push(dt)));
    updateAnimationManager(manager, -1);
    updateAnimationManager(manager, Number.NaN);
    updateAnimationManager(manager, Number.POSITIVE_INFINITY);
    updateAnimationManager(manager, 0);
    updateAnimationManager(manager, 7);
    expect(seen).toEqual([0, 7]);
});

test("fixedDeltaMs can be changed on the manager after creation", () => {
    const manager = createAnimationManager();
    const seen: number[] = [];
    addAnimationTask(manager, createAnimationTask((_m, dt) => seen.push(dt)));
    manager.fixedDeltaMs = 20;
    updateAnimationManager(manager, 3);
    expect(seen).toEqual([20]);
});
