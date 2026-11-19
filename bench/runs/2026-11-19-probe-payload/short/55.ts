import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a 1 s non-looping group, ten updates of 100 ms, then one more", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const group = createPropertyAnimationGroup(manager, { v: 0 }, clip, { loop: false });
    for (let i = 0; i < 10; i++) updateAnimationManager(manager, 100);
    expect(group.currentTime).toBe(0.9999999999999999);
    expect(group.isPlaying).toBe(true);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBe(1);
    expect(group.isPlaying).toBe(false);
});
