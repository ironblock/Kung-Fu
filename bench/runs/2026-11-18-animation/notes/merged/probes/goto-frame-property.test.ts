// Note: goToFrame pauses the group and, for a property group, writes at once; it clamps to 0..clip duration, not to the play range; playAnimation resumes from there.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, playAnimation, updateAnimationManager } from "@babylonjs/lite";

it("seeks and pauses", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", frameRate: 10, keys: [{ frame: 0, value: 0 }, { frame: 20, value: 20 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip, { fromFrame: 5, toFrame: 10, loop: false });
    goToFrame(group, 2);
    expect(group.isPlaying).toBe(false);
    expect(group.currentTime).toBeCloseTo(0.2);
    expect(target.v).toBeCloseTo(2);
    goToFrame(group, 50);
    expect(group.currentTime).toBe(2);
    expect(target.v).toBe(20);
    goToFrame(group, -5);
    expect(group.currentTime).toBe(0);
    expect(target.v).toBe(0);
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBe(0);
    goToFrame(group, 6);
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBeCloseTo(0.7);
    expect(target.v).toBeCloseTo(7);
});
