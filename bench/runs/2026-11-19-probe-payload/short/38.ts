import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, updateAnimationManager } from "@babylonjs/lite";

test("a clip keyed at frames 0 and 120 with no frameRate; updates of 250 ms, speedRatio 2, goToFrame 30", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ frame: 0, value: 0 }, { frame: 120, value: 10 }] }]);
    const group = createPropertyAnimationGroup(manager, { v: 0 }, clip);
    expect(group.frameRate).toBe(60);
    expect(group.duration).toBe(2);
    updateAnimationManager(manager, 250);
    expect(group.currentTime).toBe(0.25);
    group.speedRatio = 2;
    updateAnimationManager(manager, 250);
    expect(group.currentTime).toBe(0.75);
    goToFrame(group, 30);
    expect(group.currentTime).toBe(0.5);
});
