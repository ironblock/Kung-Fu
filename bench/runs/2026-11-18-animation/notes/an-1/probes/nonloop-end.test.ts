// Note: a non-looping property group clamps at the end, writes the last value, sets isPlaying false that update; later updates do not write; it stays attached.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, getAnimationGroups, updateAnimationManager } from "@babylonjs/lite";

it("ends", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip, { loop: false });
    updateAnimationManager(manager, 900);
    expect(group.isPlaying).toBe(true);
    updateAnimationManager(manager, 300);
    expect(group.currentTime).toBe(1);
    expect(target.v).toBe(10);
    expect(group.isPlaying).toBe(false);
    target.v = 99;
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(99);
    expect(getAnimationGroups(manager)).toEqual([group]);
});
