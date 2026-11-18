// Note: without a blending call on the manager, weight has no effect; each group writes its full value and the later-attached group wins.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const constant = (v: number) => createPropertyAnimationClip("c" + v, [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

it("ignores weight", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const a = createPropertyAnimationGroup(manager, target, constant(10));
    setAnimationWeight(a, 0.5);
    updateAnimationManager(manager, 16);
    expect(target.v).toBe(10);
    const b = createPropertyAnimationGroup(manager, target, constant(20));
    setAnimationWeight(b, 0.25);
    updateAnimationManager(manager, 16);
    expect(target.v).toBe(20);
});
