// Note: playAnimation alone on a finished property group stops again at once; stopAnimation then playAnimation, or a seek before playAnimation, replays.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";

const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);

it("playAnimation alone does not replay", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, clip, { loop: false });
    updateAnimationManager(manager, 2000);
    playAnimation(group);
    expect(group.isPlaying).toBe(true);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBe(1);
    expect(target.v).toBe(10);
    expect(group.isPlaying).toBe(false);
});

it("stopAnimation then playAnimation replays from the start", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, clip, { loop: false });
    updateAnimationManager(manager, 2000);
    stopAnimation(group);
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBeCloseTo(0.1);
    expect(target.v).toBeCloseTo(1);
    expect(group.isPlaying).toBe(true);
});

it("a seek then playAnimation replays from the seek", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, clip, { loop: false });
    updateAnimationManager(manager, 2000);
    group.currentTime = 0.2;
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBeCloseTo(0.3);
    expect(group.isPlaying).toBe(true);

    updateAnimationManager(manager, 2000);
    goToFrame(group, 30);
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBeCloseTo(0.6);
    expect(target.v).toBeCloseTo(6);
    expect(group.isPlaying).toBe(true);
});
