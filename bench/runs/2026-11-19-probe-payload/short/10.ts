import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a 0..20 ramp over 2 s: looping, looping at speed -1, and not looping at speed -1 from 1 s", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 2, value: 20 }] }]);
    const a = { v: -1 }, b = { v: -1 }, c = { v: -1 };
    const loop = createPropertyAnimationGroup(manager, a, clip);
    const back = createPropertyAnimationGroup(manager, b, clip, { speedRatio: -1 });
    const once = createPropertyAnimationGroup(manager, c, clip, { speedRatio: -1, loop: false, fromTime: 1 });
    updateAnimationManager(manager, 500);
    expect(back.currentTime).toBe(1.5);
    expect(b.v).toBe(15);
    updateAnimationManager(manager, 1500);
    expect(loop.currentTime).toBe(0);
    expect(a.v).toBe(0);
    expect(once.currentTime).toBe(1);
    expect(c.v).toBe(10);
    expect(once.isPlaying).toBe(true);
});
