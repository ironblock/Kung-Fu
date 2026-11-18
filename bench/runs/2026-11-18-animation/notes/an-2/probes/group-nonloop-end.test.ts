import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";

const clip = () => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);

test("a non-looping property group writes the end value, then isPlaying is false and it no longer writes", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip(), { loop: false });
    updateAnimationManager(manager, 5000);
    expect(group.currentTime).toBe(1);
    expect(target.v).toBe(10);
    expect(group.isPlaying).toBe(false);
    target.v = 99;
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(99);
});

test("playAnimation on a finished non-looping group does not restart it; stopAnimation then playAnimation does", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip(), { loop: false });
    updateAnimationManager(manager, 5000);
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBe(1);
    expect(group.isPlaying).toBe(false);
    expect(target.v).toBe(10);

    stopAnimation(group);
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBeCloseTo(0.1, 10);
    expect(target.v).toBeCloseTo(1, 5);
    expect(group.isPlaying).toBe(true);
});

test("setting currentTime back and calling playAnimation also restarts a finished group", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip(), { loop: false });
    updateAnimationManager(manager, 5000);
    group.currentTime = 0;
    playAnimation(group);
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(5);
});
