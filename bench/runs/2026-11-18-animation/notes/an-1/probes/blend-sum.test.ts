// Note: with enablePropertyAnimationBlending, a property is mixed only when a group on it has weight other than 1; the mix is the plain sum of value*weight.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const constant = (v: number) => createPropertyAnimationClip("c" + v, [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

it("sums weighted values without normalizing", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 100 };
    const a = createPropertyAnimationGroup(manager, target, constant(10));
    setAnimationWeight(a, 0.5);
    updateAnimationManager(manager, 16);
    expect(target.v).toBe(5);
    const b = createPropertyAnimationGroup(manager, target, constant(20));
    setAnimationWeight(b, 0.25);
    updateAnimationManager(manager, 16);
    expect(target.v).toBe(10);
    setAnimationWeight(a, 0.9);
    setAnimationWeight(b, 1);
    updateAnimationManager(manager, 16);
    expect(target.v).toBe(29);
    setAnimationWeight(a, 1);
    updateAnimationManager(manager, 16);
    expect(target.v).toBe(20);
});

it("mixes vector components the same way", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { p: { x: 4, y: 4, z: 4 } };
    const clip = createPropertyAnimationClip("p", [{ path: "p", keys: [{ time: 0, value: [10, 2, 0] }, { time: 1, value: [10, 2, 0] }] }]);
    setAnimationWeight(createPropertyAnimationGroup(manager, target, clip), 0.5);
    updateAnimationManager(manager, 16);
    expect(target.p).toEqual({ x: 5, y: 1, z: 0 });
});
