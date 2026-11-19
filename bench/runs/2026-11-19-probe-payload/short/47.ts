import { expect, test } from "vitest";
import { addAnimationGroup, clearAnimationManager, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, getAnimationGroups } from "@babylonjs/lite";

test("one group added to a second manager, then to its own, then its manager cleared", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    const m1 = createAnimationManager();
    const m2 = createAnimationManager();
    const g = createPropertyAnimationGroup(m1, { v: 0 }, clip);
    const list = getAnimationGroups(m1);
    expect(() => addAnimationGroup(m2, g)).toThrow('AnimationGroup "c" is already attached to another AnimationManager');
    addAnimationGroup(m1, g);
    expect(list).toEqual([g]);
    const h = createPropertyAnimationGroup(m1, { v: 0 }, clip);
    expect(list).toEqual([g, h]);
    expect(getAnimationGroups(m1)).toBe(list);
    clearAnimationManager(m1);
    expect(list).toEqual([]);
    addAnimationGroup(m2, g);
    addAnimationGroup(m2, h);
    expect(getAnimationGroups(m2)).toEqual([g, h]);
});
