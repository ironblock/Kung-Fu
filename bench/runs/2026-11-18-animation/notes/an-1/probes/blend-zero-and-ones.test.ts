// Note: under enablePropertyAnimationBlending, all groups at weight 0 leave the property unwritten; two groups at weight 1 are not mixed, the later-attached wins.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const constant = (v: number) => createPropertyAnimationClip("c" + v, [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

it("weight 0 everywhere writes nothing; weight 1 twice is last-writer", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    const a = createPropertyAnimationGroup(manager, target, constant(10));
    const b = createPropertyAnimationGroup(manager, target, constant(20));
    updateAnimationManager(manager, 16);
    expect(target.v).toBe(20);
    setAnimationWeight(a, 0);
    setAnimationWeight(b, 0);
    target.v = 55;
    updateAnimationManager(manager, 16);
    expect(target.v).toBe(55);
    expect(a.isPlaying && b.isPlaying).toBe(true);
});
