import { expect, it } from "vitest";
import { playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";
import { rampGroup } from "./_lib";

it("playAnimation alone does not replay a finished non-looping group; stopAnimation first, or set currentTime", () => {
    const { manager, target, group } = rampGroup({ loop: false });
    updateAnimationManager(manager, 1500);
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBe(1);
    expect(target.value).toBe(10);
    expect(group.isPlaying).toBe(false);

    stopAnimation(group);
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBeCloseTo(0.1);
    expect(target.value).toBeCloseTo(1);
    expect(group.isPlaying).toBe(true);

    updateAnimationManager(manager, 1500);
    playAnimation(group);
    group.currentTime = 0;
    updateAnimationManager(manager, 300);
    expect(target.value).toBeCloseTo(3);
});
