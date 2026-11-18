import { expect, it } from "vitest";
import { addAnimationTask, createAnimationManager, createAnimationTask, createPropertyAnimationGroup, getAnimationGroups, updateAnimationManager } from "@babylonjs/lite";
import { constClip, rampClip } from "./_lib";

it("groups and tasks run in first-attach order; without blending the last group on a property wins", () => {
    const manager = createAnimationManager();
    const target = { value: 0 };
    const seen: number[] = [];
    addAnimationTask(manager, createAnimationTask(() => seen.push(target.value)));
    createPropertyAnimationGroup(manager, target, rampClip());
    addAnimationTask(manager, createAnimationTask(() => seen.push(target.value)));
    updateAnimationManager(manager, 500);
    expect(seen).toEqual([0, 5]);

    const m2 = createAnimationManager();
    const t2 = { value: 0 };
    createPropertyAnimationGroup(m2, t2, constClip("a", 1));
    createPropertyAnimationGroup(m2, t2, constClip("b", 2));
    updateAnimationManager(m2, 100);
    expect(t2.value).toBe(2);
    expect(getAnimationGroups(m2).map((g) => g.name)).toEqual(["a", "b"]);
});
