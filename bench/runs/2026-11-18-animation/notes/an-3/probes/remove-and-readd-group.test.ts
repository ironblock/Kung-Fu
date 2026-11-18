import { expect, it } from "vitest";
import { addAnimationGroup, createAnimationManager, createPropertyAnimationGroup, getAnimationGroups, removeAnimationGroup, updateAnimationManager } from "@babylonjs/lite";
import { constClip, thrown } from "./_lib";

it("removeAnimationGroup stops updates; another manager throws until removal; re-adding keeps first-attach order", () => {
    const manager = createAnimationManager();
    const target = { value: 0 };
    const a = createPropertyAnimationGroup(manager, target, constClip("a", 1));
    const b = createPropertyAnimationGroup(manager, target, constClip("b", 2));
    const other = createAnimationManager();
    expect(thrown(() => addAnimationGroup(other, a))).toMatch(/already attached to another AnimationManager/);
    removeAnimationGroup(manager, b);
    updateAnimationManager(manager, 100);
    expect(target.value).toBe(1);
    removeAnimationGroup(manager, a);
    addAnimationGroup(manager, b);
    addAnimationGroup(manager, a);
    expect(getAnimationGroups(manager).map((g) => g.name)).toEqual(["a", "b"]);
    updateAnimationManager(manager, 100);
    expect(target.value).toBe(2);

    removeAnimationGroup(manager, b);
    addAnimationGroup(other, b);
    target.value = 0;
    updateAnimationManager(other, 100);
    expect(target.value).toBe(2);
});
