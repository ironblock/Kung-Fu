import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, pauseAnimation, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";

const clip = () => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 2, value: 20 }] }]);

test("a paused property group keeps currentTime and does not write; playAnimation resumes from currentTime", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip());
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(5);
    pauseAnimation(group);
    expect(group.isPlaying).toBe(false);
    target.v = 99;
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(99);
    playAnimation(group);
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBe(1);
    expect(target.v).toBe(10);
});

test("stopAnimation sets currentTime to the start, writes nothing, and the group is not ticked until playAnimation", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip(), { fromTime: 0.5 });
    expect(group.currentTime).toBe(0.5);
    updateAnimationManager(manager, 1000);
    expect(target.v).toBe(15);
    stopAnimation(group);
    expect(group.isPlaying).toBe(false);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(15);
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(15);
    expect(group.currentTime).toBe(0.5);
    playAnimation(group);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(5);
});
