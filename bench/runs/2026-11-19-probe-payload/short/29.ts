import { expect, test } from "vitest";
import { addAnimationGroup, clearAnimationManager, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, getAnimationGroups, removeAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const hold = (v: number) => createPropertyAnimationClip("c" + v, [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

test("groups a, b, c writing 1, 2, 3 to one property; a removed and added again; then clearAnimationManager", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const a = createPropertyAnimationGroup(manager, target, hold(1));
    const b = createPropertyAnimationGroup(manager, target, hold(2));
    const c = createPropertyAnimationGroup(manager, target, hold(3));
    removeAnimationGroup(manager, a);
    expect(getAnimationGroups(manager)).toEqual([b, c]);
    addAnimationGroup(manager, a);
    expect(getAnimationGroups(manager)).toEqual([a, b, c]);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(3);
    clearAnimationManager(manager);
    expect(getAnimationGroups(manager)).toEqual([]);
    const other = createAnimationManager();
    addAnimationGroup(other, b);
    expect(getAnimationGroups(other)).toEqual([b]);
});
