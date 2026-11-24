// c-23. Line 577: "Weights intentionally use Babylon-style weighted sums for this first layer:
// `final = sum(group.weight * sampledValue)` for the groups targeting the same property."
// Checked with the property mixer on: weights 0.5 and 0.25 on values 10 and 20 give 0.5*10 + 0.25*20 = 10.
// The comparison with Babylon.js is not checked.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const constant = (v: number) => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

test("final = sum(weight * sample)", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    setAnimationWeight(createPropertyAnimationGroup(manager, target, constant(10)), 0.5);
    setAnimationWeight(createPropertyAnimationGroup(manager, target, constant(20)), 0.25);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(10);
});
