import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, pauseAnimation, playAnimation, updateAnimationManager } from "@babylonjs/lite";

test("a paused property group: updates, currentTime set, goToFrame, playAnimation", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 200);
    pauseAnimation(group);
    target.v = 50;
    updateAnimationManager(manager, 200);
    expect(target.v).toBe(50);
    group.currentTime = 0.8;
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(50);
    goToFrame(group, 30);
    expect(target.v).toBe(5);
    target.v = 50;
    playAnimation(group);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(5);
});
