import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, pauseAnimation, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";

test("a 0..20 ramp over 2 s with fromTime 0.5: pause, play, stop", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 2, value: 20 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip, { fromTime: 0.5 });
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(10);
    pauseAnimation(group);
    target.v = 99;
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBe(1);
    expect(target.v).toBe(99);
    playAnimation(group);
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBe(1.5);
    expect(target.v).toBe(15);
    stopAnimation(group);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(15);
});
