// Note: setAnimationWeight throws outside 0..1 or for non-finite weights; assigning group.weight is unchecked.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, setAnimationWeight } from "@babylonjs/lite";

it("validates", () => {
    const group = createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]));
    expect(group.weight).toBe(1);
    expect(() => setAnimationWeight(group, 1.5)).toThrow();
    expect(() => setAnimationWeight(group, -0.1)).toThrow();
    expect(() => setAnimationWeight(group, NaN)).toThrow();
    setAnimationWeight(group, 0);
    expect(group.weight).toBe(0);
    group.weight = 3;
    expect(group.weight).toBe(3);
});
