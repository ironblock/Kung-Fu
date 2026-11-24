import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, setAnimationWeight } from "@babylonjs/lite";

test("setAnimationWeight with 1.5, -0.1, NaN, Infinity, 0 and 1; then group.weight = 3", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    const group = createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, clip);
    expect(() => setAnimationWeight(group, 1.5)).toThrow("Animation weight must be a finite number between 0 and 1, got 1.5");
    expect(() => setAnimationWeight(group, -0.1)).toThrow();
    expect(() => setAnimationWeight(group, NaN)).toThrow();
    expect(() => setAnimationWeight(group, Infinity)).toThrow();
    setAnimationWeight(group, 0);
    setAnimationWeight(group, 1);
    expect(group.weight).toBe(1);
    group.weight = 3;
    expect(group.weight).toBe(3);
});
