import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, playAnimation, updateAnimationManager } from "@babylonjs/lite";

const clip = () =>
    createPropertyAnimationClip("c", [{ path: "v", frameRate: 10, keys: [{ frame: 0, value: 0 }, { frame: 20, value: 20 }] }]);

test("goToFrame sets currentTime = frame / group.frameRate, writes at once, and pauses", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip());
    expect(group.frameRate).toBe(10);
    goToFrame(group, 5);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(5);
    expect(group.isPlaying).toBe(false);
    updateAnimationManager(manager, 1000);
    expect(group.currentTime).toBe(0.5);
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBeCloseTo(0.6, 10);
    expect(target.v).toBeCloseTo(6, 4);
});

test("for a property group goToFrame clamps to [0, clip duration], not to the play range", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip(), { fromFrame: 5, toFrame: 15 });
    goToFrame(group, 2);
    expect(group.currentTime).toBeCloseTo(0.2, 10);
    expect(target.v).toBeCloseTo(2, 5);
    goToFrame(group, 50);
    expect(group.currentTime).toBe(2);
    expect(target.v).toBe(20);
    goToFrame(group, -3);
    expect(group.currentTime).toBe(0);
    expect(target.v).toBe(0);
});

test("a looping group moved outside its play range by goToFrame wraps back into it on the next update", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip(), { fromFrame: 5, toFrame: 15 });
    goToFrame(group, 2);
    playAnimation(group);
    updateAnimationManager(manager, 0);
    // 0.2 is wrapped as 0.5 + ((0.2 - 0.5) mod 1) = 1.2
    expect(group.currentTime).toBeCloseTo(1.2, 6);
});
