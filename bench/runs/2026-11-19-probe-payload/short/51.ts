import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("speedRatio -1 on a looping group, and on a non-looping group with fromTime 0.2", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const manager = createAnimationManager();
    const looped = { v: -1 };
    const a = createPropertyAnimationGroup(manager, looped, clip, { speedRatio: -1 });
    updateAnimationManager(manager, 250);
    expect(a.currentTime).toBe(0.75);
    expect(looped.v).toBe(7.5);

    const manager2 = createAnimationManager();
    const once = { v: -1 };
    const b = createPropertyAnimationGroup(manager2, once, clip, { loop: false, fromTime: 0.2 });
    updateAnimationManager(manager2, 500);
    b.speedRatio = -1;
    updateAnimationManager(manager2, 2000);
    expect(b.currentTime).toBe(0.2);
    expect(once.v).toBe(2);
    updateAnimationManager(manager2, 2000);
    expect(b.currentTime).toBe(0.2);
    expect(b.isPlaying).toBe(true);
});
