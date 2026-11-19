// c-26. Lines 579-580: "Each contributing property track is eased and sampled before its group weight is applied."
// Checked with the property mixer on: a 0-to-10 track eased by g*g, at 0.5 s, in a group of weight 0.5, writes
// 0.5 * (10 * 0.25) = 1.25.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("weight applies to the eased sample", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", easing: (g) => g * g, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    setAnimationWeight(createPropertyAnimationGroup(manager, target, clip), 0.5);
    updateAnimationManager(manager, 500);
    expect(target.v).toBeCloseTo(1.25, 6);
});
