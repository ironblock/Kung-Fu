// Note: enableAnimationBlending and enablePropertyAnimationBlending share one slot per manager; the last call wins; setAnimationAdditive on an attached group calls enableAnimationBlending.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enableAnimationBlending, enablePropertyAnimationBlending, setAnimationAdditive, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const constant = (v: number) => createPropertyAnimationClip("c" + v, [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

it("last enable wins", () => {
    const m1 = createAnimationManager();
    enablePropertyAnimationBlending(m1);
    enableAnimationBlending(m1);
    const t1 = { v: 0 };
    setAnimationWeight(createPropertyAnimationGroup(m1, t1, constant(10)), 0.5);
    updateAnimationManager(m1, 16);
    expect(t1.v).toBe(10);

    const m2 = createAnimationManager();
    enableAnimationBlending(m2);
    enablePropertyAnimationBlending(m2);
    const t2 = { v: 0 };
    setAnimationWeight(createPropertyAnimationGroup(m2, t2, constant(10)), 0.5);
    updateAnimationManager(m2, 16);
    expect(t2.v).toBe(5);
});

it("setAnimationAdditive switches an attached group's manager to enableAnimationBlending", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, constant(10));
    setAnimationWeight(group, 0.5);
    updateAnimationManager(manager, 16);
    expect(target.v).toBe(5);
    setAnimationAdditive(group);
    updateAnimationManager(manager, 16);
    expect(target.v).toBe(10);
});
