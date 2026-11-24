// c-69. Line 641 (map row): "manual property weighted blending" corresponds to `enablePropertyAnimationBlending(manager)`
// + `setAnimationWeight(group, weight)`.
// Checked: with both calls, one property group of weight 0.4 on value 10 writes 4.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("enablePropertyAnimationBlending + setAnimationWeight", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    setAnimationWeight(createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 10 }, { time: 1, value: 10 }] }])), 0.4);
    updateAnimationManager(manager, 0);
    expect(target.v).toBeCloseTo(4, 5);
});
