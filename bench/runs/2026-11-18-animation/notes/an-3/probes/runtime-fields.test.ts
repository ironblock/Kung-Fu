import { expect, it } from "vitest";
import { updateAnimationManager } from "@babylonjs/lite";
import { rampGroup } from "./_lib";

it("currentTime, speedRatio and loopAnimation set on a playing group apply on the next update", () => {
    const { manager, target, group } = rampGroup();
    updateAnimationManager(manager, 100);
    group.currentTime = 0.5;
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBeCloseTo(0.6);
    expect(target.value).toBeCloseTo(6);
    group.speedRatio = 2;
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBeCloseTo(0.8);
    group.loopAnimation = false;
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBe(1);
    expect(group.isPlaying).toBe(false);
});
