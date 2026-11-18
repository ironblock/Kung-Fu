// Note: addAnimationGroup throws for a group owned by another manager; re-adding to its own manager does nothing; getAnimationGroups returns the manager's live array; clearAnimationManager detaches all.
import { expect, it } from "vitest";
import { addAnimationGroup, clearAnimationManager, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, getAnimationGroups, removeAnimationGroup } from "@babylonjs/lite";

it("ownership", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    const m1 = createAnimationManager();
    const m2 = createAnimationManager();
    const group = createPropertyAnimationGroup(m1, { v: 0 }, clip);
    const list = getAnimationGroups(m1);
    expect(() => addAnimationGroup(m2, group)).toThrow(/already attached to another AnimationManager/);
    addAnimationGroup(m1, group);
    expect(list).toEqual([group]);
    expect(m1.animations.length).toBe(1);
    removeAnimationGroup(m1, group);
    expect(list).toEqual([]);
    addAnimationGroup(m2, group);
    expect(getAnimationGroups(m2)).toEqual([group]);
    const other = createPropertyAnimationGroup(m2, { v: 0 }, clip);
    clearAnimationManager(m2);
    expect(getAnimationGroups(m2)).toEqual([]);
    expect(group._animationManager).toBeUndefined();
    expect(other._animationManager).toBeUndefined();
});
