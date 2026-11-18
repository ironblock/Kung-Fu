import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, fadeAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const constant = (value: number) => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value }, { time: 1, value }] }]);

test("fadeAnimationWeight sets weight to from at the call, then moves it linearly at the start of each update, ending exactly on to", () => {
    const manager = createAnimationManager();
    const group = createPropertyAnimationGroup(manager, { v: 0 }, constant(1));
    fadeAnimationWeight(manager, group, { from: 0.2, to: 1, durationMs: 400 });
    expect(group.weight).toBe(0.2);
    updateAnimationManager(manager, 100);
    expect(group.weight).toBeCloseTo(0.4, 10);
    updateAnimationManager(manager, 200);
    expect(group.weight).toBeCloseTo(0.8, 10);
    updateAnimationManager(manager, 1000);
    expect(group.weight).toBe(1);
});

test("from defaults to the current weight", () => {
    const manager = createAnimationManager();
    const group = createPropertyAnimationGroup(manager, { v: 0 }, constant(1));
    fadeAnimationWeight(manager, group, { to: 0, durationMs: 100 });
    expect(group.weight).toBe(1);
    updateAnimationManager(manager, 50);
    expect(group.weight).toBe(0.5);
});

test("a new fade on the same group replaces the running one", () => {
    const manager = createAnimationManager();
    const group = createPropertyAnimationGroup(manager, { v: 0 }, constant(1));
    fadeAnimationWeight(manager, group, { to: 0, durationMs: 100 });
    updateAnimationManager(manager, 50);
    fadeAnimationWeight(manager, group, { to: 1, durationMs: 100 });
    updateAnimationManager(manager, 50);
    expect(group.weight).toBe(0.75);
    updateAnimationManager(manager, 100);
    expect(group.weight).toBe(1);
});

test("the fade throws for durationMs not finite and above 0, or a weight outside [0, 1]", () => {
    const manager = createAnimationManager();
    const group = createPropertyAnimationGroup(manager, { v: 0 }, constant(1));
    expect(() => fadeAnimationWeight(manager, group, { to: 0, durationMs: 0 })).toThrow("Animation weight fade duration must be a finite positive number, got 0");
    expect(() => fadeAnimationWeight(manager, group, { to: 0, durationMs: Infinity })).toThrow();
    expect(() => fadeAnimationWeight(manager, group, { to: 2, durationMs: 10 })).toThrow("Animation weight must be a finite number between 0 and 1, got 2");
});

test("the fade runs on updates of the manager passed to it, also with fixedDeltaMs", () => {
    const manager = createAnimationManager({ fixedDeltaMs: 25 });
    const other = createAnimationManager();
    const group = createPropertyAnimationGroup(other, { v: 0 }, constant(1));
    fadeAnimationWeight(manager, group, { to: 0, durationMs: 100 });
    updateAnimationManager(other, 50);
    expect(group.weight).toBe(1);
    updateAnimationManager(manager, 1000);
    expect(group.weight).toBe(0.75);
});
