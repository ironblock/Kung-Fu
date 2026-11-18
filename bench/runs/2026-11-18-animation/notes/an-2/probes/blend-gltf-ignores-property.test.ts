import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enableAnimationBlending, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const constant = (value: number) => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value }, { time: 1, value }] }]);

test("enableAnimationBlending replaces enablePropertyAnimationBlending on the same manager; property weights are then ignored", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    enableAnimationBlending(manager);
    const target = { v: 0 };
    const a = createPropertyAnimationGroup(manager, target, constant(10));
    setAnimationWeight(a, 0.5);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(10);
});

test("the other order: enablePropertyAnimationBlending called last makes property weights count", () => {
    const manager = createAnimationManager();
    enableAnimationBlending(manager);
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    const a = createPropertyAnimationGroup(manager, target, constant(10));
    setAnimationWeight(a, 0.5);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(5);
});
