// Note: fadeAnimationWeight sets weight to from at once and tweens it linearly by each update's step, before groups are evaluated; it enables no blending; a new fade replaces the old.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, fadeAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const constant = (v: number) => createPropertyAnimationClip("c" + v, [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

it("tweens weight only", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, constant(10));
    fadeAnimationWeight(manager, group, { from: 0.2, to: 1, durationMs: 1000 });
    expect(group.weight).toBe(0.2);
    updateAnimationManager(manager, 500);
    expect(group.weight).toBeCloseTo(0.6);
    expect(target.v).toBe(10);
    fadeAnimationWeight(manager, group, { to: 0, durationMs: 100 });
    expect(group.weight).toBeCloseTo(0.6);
    updateAnimationManager(manager, 50);
    expect(group.weight).toBeCloseTo(0.3);
    updateAnimationManager(manager, 500);
    expect(group.weight).toBe(0);
    expect(group.isPlaying).toBe(true);
});

it("the weight used in an update is the faded one", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, constant(10));
    fadeAnimationWeight(manager, group, { to: 0, durationMs: 1000 });
    updateAnimationManager(manager, 250);
    expect(group.weight).toBe(0.75);
    expect(target.v).toBe(7.5);
});
