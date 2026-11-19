import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const hold = (v: number) => createPropertyAnimationClip("c" + v, [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

test("property blending on a target starting at 100: one group at 0.5, then a second group", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 100 };
    const a = createPropertyAnimationGroup(manager, target, hold(10));
    setAnimationWeight(a, 0.5);
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(5);
    const b = createPropertyAnimationGroup(manager, target, hold(20));
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(25);
    setAnimationWeight(b, 0.25);
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(10);
});
