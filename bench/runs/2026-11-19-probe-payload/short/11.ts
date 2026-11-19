import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const hold = (v: number) => createPropertyAnimationClip("c" + v, [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

test("two weighted groups on one property, no blending call", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const a = createPropertyAnimationGroup(manager, target, hold(10));
    setAnimationWeight(a, 0.5);
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(10);
    const b = createPropertyAnimationGroup(manager, target, hold(20));
    setAnimationWeight(b, 0.25);
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(20);
});
