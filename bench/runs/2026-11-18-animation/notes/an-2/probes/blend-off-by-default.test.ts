import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const constant = (value: number) => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value }, { time: 1, value }] }]);

test("without a blending call, weight is ignored and the group added last writes last", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const a = createPropertyAnimationGroup(manager, target, constant(10));
    const b = createPropertyAnimationGroup(manager, target, constant(20));
    setAnimationWeight(a, 0.5);
    setAnimationWeight(b, 0.25);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(20);
    setAnimationWeight(b, 0);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(20);
});
