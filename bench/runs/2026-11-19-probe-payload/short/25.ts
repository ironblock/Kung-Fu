import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enableAnimationBlending, enablePropertyAnimationBlending, setAnimationAdditive, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const ten = createPropertyAnimationClip("ten", [{ path: "v", keys: [{ time: 0, value: 10 }, { time: 1, value: 10 }] }]);

function halfWeight(...enable: ((m: ReturnType<typeof createAnimationManager>) => void)[]) {
    const manager = createAnimationManager();
    for (const e of enable) e(manager);
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, ten);
    setAnimationWeight(group, 0.5);
    updateAnimationManager(manager, 16);
    return { manager, target, group };
}

test("a weight-0.5 property group holding 10, under each order of the two blending calls, then setAnimationAdditive", () => {
    expect(halfWeight(enableAnimationBlending, enablePropertyAnimationBlending).target.v).toBe(5);
    expect(halfWeight(enablePropertyAnimationBlending, enableAnimationBlending).target.v).toBe(10);
    const { manager, target, group } = halfWeight(enablePropertyAnimationBlending);
    expect(target.v).toBe(5);
    setAnimationAdditive(group);
    updateAnimationManager(manager, 16);
    expect(target.v).toBe(10);
});
