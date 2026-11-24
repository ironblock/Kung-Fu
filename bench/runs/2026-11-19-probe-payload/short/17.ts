import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("currentTime, speedRatio, loopAnimation and isPlaying written on a 0..40 ramp over 4 s", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 4, value: 40 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip);
    group.currentTime = 2;
    group.speedRatio = 2;
    expect(target.v).toBe(-1);
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBe(3);
    expect(target.v).toBe(30);
    group.loopAnimation = false;
    updateAnimationManager(manager, 1000);
    expect(group.currentTime).toBe(4);
    expect(group.isPlaying).toBe(false);
    const other = createPropertyAnimationGroup(manager, target, clip);
    other.isPlaying = false;
    target.v = -1;
    updateAnimationManager(manager, 1000);
    expect(other.currentTime).toBe(0);
    expect(target.v).toBe(-1);
});
