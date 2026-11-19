import { expect, test } from "vitest";
import { addAnimationTask, createAnimationManager, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);

test("updates of 100, 0, -5, NaN and Infinity ms, with fixedDeltaMs 10 and without it", () => {
    const fixed = createAnimationManager({ fixedDeltaMs: 10 });
    const steps: number[] = [];
    addAnimationTask(fixed, createAnimationTask((_m, deltaMs) => steps.push(deltaMs)));
    for (const d of [100, 0, -5, NaN]) updateAnimationManager(fixed, d);
    expect(steps).toEqual([10, 10, 10, 10]);
    const plain = createAnimationManager();
    const seen: number[] = [];
    addAnimationTask(plain, createAnimationTask((_m, deltaMs) => seen.push(deltaMs)));
    const target = { v: 3 };
    const group = createPropertyAnimationGroup(plain, target, clip);
    for (const d of [-5, NaN, Infinity]) updateAnimationManager(plain, d);
    expect(seen).toEqual([]);
    expect(group.currentTime).toBe(0);
    expect(target.v).toBe(3);
});
