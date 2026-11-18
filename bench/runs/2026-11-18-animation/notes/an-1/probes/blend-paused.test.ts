// Note: under enablePropertyAnimationBlending, a paused group with weight other than 1 still writes its weighted value each update; a stopped group writes nothing.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, pauseAnimation, setAnimationWeight, stopAnimation, updateAnimationManager } from "@babylonjs/lite";

it("paused groups still contribute", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 500);
    pauseAnimation(group);
    target.v = 99;
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(99);
    setAnimationWeight(group, 0.5);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(2.5);
    stopAnimation(group);
    target.v = 99;
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(99);
});
