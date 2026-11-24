// Note: removeAnimationGroup stops the manager advancing the group but leaves isPlaying true and the target as it was; re-adding puts it back at its first-attachment place.
import { expect, it } from "vitest";
import { addAnimationGroup, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, getAnimationGroups, removeAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const constant = (v: number) => createPropertyAnimationClip("c" + v, [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

it("remove and re-add", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const a = createPropertyAnimationGroup(manager, target, constant(10));
    const b = createPropertyAnimationGroup(manager, target, constant(20));
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(20);
    removeAnimationGroup(manager, b);
    expect(b.isPlaying).toBe(true);
    expect(target.v).toBe(20);
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(10);
    expect(b.currentTime).toBe(0.1);
    removeAnimationGroup(manager, a);
    addAnimationGroup(manager, b);
    addAnimationGroup(manager, a);
    expect(getAnimationGroups(manager)).toEqual([a, b]);
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(20);
});
