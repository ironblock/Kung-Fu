// Note: fixedDeltaMs > 0 replaces every deltaMs passed, even 0, negative or NaN; without it a negative or non-finite deltaMs makes the update do nothing.
import { expect, it } from "vitest";
import { addAnimationTask, createAnimationManager, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);

it("fixed step", () => {
    const manager = createAnimationManager({ fixedDeltaMs: 10 });
    const steps: number[] = [];
    addAnimationTask(manager, createAnimationTask((_m, deltaMs) => steps.push(deltaMs)));
    const group = createPropertyAnimationGroup(manager, { v: 0 }, clip);
    updateAnimationManager(manager, 100);
    updateAnimationManager(manager, 0);
    updateAnimationManager(manager, -5);
    updateAnimationManager(manager, NaN);
    expect(steps).toEqual([10, 10, 10, 10]);
    expect(group.currentTime).toBeCloseTo(0.04);
});

it("bad deltas skip the update", () => {
    const manager = createAnimationManager();
    const steps: number[] = [];
    addAnimationTask(manager, createAnimationTask((_m, deltaMs) => steps.push(deltaMs)));
    const target = { v: 3 };
    const group = createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, -5);
    updateAnimationManager(manager, NaN);
    updateAnimationManager(manager, Infinity);
    expect(steps).toEqual([]);
    expect(target.v).toBe(3);
    expect(group.currentTime).toBe(0);
});
