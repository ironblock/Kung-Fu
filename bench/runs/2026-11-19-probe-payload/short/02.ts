import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, getAnimationGroups, updateAnimationManager } from "@babylonjs/lite";

test("a property group just created, with and without loop: false", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip);
    expect(getAnimationGroups(manager)).toEqual([group]);
    expect(group.isPlaying).toBe(true);
    expect(group.loopAnimation).toBe(true);
    expect(target.v).toBe(-1);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(0);
    const once = createPropertyAnimationGroup(manager, { v: 0 }, clip, { loop: false });
    expect(once.loopAnimation).toBe(false);
    expect(once.isPlaying).toBe(true);
});
