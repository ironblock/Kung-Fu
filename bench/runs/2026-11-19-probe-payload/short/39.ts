import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";

const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);

test("a non-looping 1 s group run 2 s, then three ways of calling playAnimation and updating 100 ms", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, clip, { loop: false });
    updateAnimationManager(manager, 2000);
    playAnimation(group);
    expect(group.isPlaying).toBe(true);
    updateAnimationManager(manager, 100);
    expect([group.currentTime, target.v, group.isPlaying]).toEqual([1, 10, false]);
    stopAnimation(group);
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect([group.currentTime, target.v, group.isPlaying]).toEqual([0.1, 1, true]);
    updateAnimationManager(manager, 2000);
    group.currentTime = 0.5;
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect([group.currentTime, target.v, group.isPlaying]).toEqual([0.6, 6, true]);
});
