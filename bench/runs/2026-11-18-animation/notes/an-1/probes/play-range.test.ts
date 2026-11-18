// Note: fromFrame/toFrame are divided by the clip frameRate; the group starts at fromTime, loops inside fromTime..toTime, and stopAnimation returns to fromTime.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, stopAnimation, updateAnimationManager } from "@babylonjs/lite";

it("range", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", frameRate: 10, keys: [{ frame: 0, value: 0 }, { frame: 20, value: 20 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip, { fromFrame: 5, toFrame: 15 });
    expect(group.currentTime).toBe(0.5);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(5);
    updateAnimationManager(manager, 900);
    expect(group.currentTime).toBeCloseTo(1.4);
    updateAnimationManager(manager, 200);
    expect(group.currentTime).toBeCloseTo(0.6);
    expect(target.v).toBeCloseTo(6);
    stopAnimation(group);
    expect(group.currentTime).toBe(0.5);
});
