// c-24. Line 577: "The mixer does not normalize totals and does not blend toward rest pose."
// Checked with the property mixer on: one group of weight 0.5 on value 10, on a property that held 100 before, writes
// 5: not 10 (normalized) and not 55 (blended toward the earlier value).
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("weight 0.5 of 10 is 5", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 100 };
    setAnimationWeight(createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 10 }, { time: 1, value: 10 }] }])), 0.5);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(5);
});
