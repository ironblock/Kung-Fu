import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const constant = (value: number | number[], path = "v") => createPropertyAnimationClip("c", [{ path, keys: [{ time: 0, value }, { time: 1, value }] }]);

test("with enablePropertyAnimationBlending, the value written is the sum of value x weight, not divided by the total weight", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    const a = createPropertyAnimationGroup(manager, target, constant(10));
    setAnimationWeight(a, 0.5);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(5);

    const b = createPropertyAnimationGroup(manager, target, constant(20));
    setAnimationWeight(b, 0.25);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(10);

    setAnimationWeight(a, 0.8);
    setAnimationWeight(b, 0.8);
    updateAnimationManager(manager, 0);
    expect(target.v).toBeCloseTo(24, 5);
});

test("a weight-1 group on a property that a weighted group also animates adds its full value to the sum", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    createPropertyAnimationGroup(manager, target, constant(10));
    const b = createPropertyAnimationGroup(manager, target, constant(20));
    setAnimationWeight(b, 0.5);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(20);
});

test("when every group on a property has weight 1, there is no mix: the group added last wins", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    createPropertyAnimationGroup(manager, target, constant(10));
    createPropertyAnimationGroup(manager, target, constant(20));
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(20);
});

test("vectors are summed per component; quaternion tracks are summed then normalized", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { p: { x: 0, y: 0, z: 0 }, rotationQuaternion: { x: 0, y: 0, z: 0, w: 0 } };
    const a = createPropertyAnimationGroup(manager, target, constant([2, 4, 6], "p"));
    setAnimationWeight(a, 0.5);
    const q = createPropertyAnimationGroup(manager, target, constant([0, 0, 0, 1], "rotationQuaternion"));
    setAnimationWeight(q, 0.3);
    updateAnimationManager(manager, 0);
    expect(target.p).toEqual({ x: 1, y: 2, z: 3 });
    expect(target.rotationQuaternion).toEqual({ x: 0, y: 0, z: 0, w: 1 });
});
