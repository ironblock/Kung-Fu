import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";

test("a non-looping 1 s group run past its end, then playAnimation, then stop and play", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip, { loop: false });
    updateAnimationManager(manager, 5000);
    expect(group.currentTime).toBe(1);
    expect(target.v).toBe(10);
    expect(group.isPlaying).toBe(false);
    target.v = 99;
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(99);
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBe(1);
    expect(group.isPlaying).toBe(false);
    stopAnimation(group);
    playAnimation(group);
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(5);
    expect(group.isPlaying).toBe(true);
});
