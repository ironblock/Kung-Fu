import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { constClip, thrown } from "./_lib";

it("setAnimationWeight throws outside [0, 1]; a direct weight write is unchecked and scales the blend sum", () => {
    const manager = createAnimationManager();
    const target = { value: 0 };
    const a = createPropertyAnimationGroup(manager, target, constClip("a", 10));
    createPropertyAnimationGroup(manager, target, constClip("b", 20));
    expect(thrown(() => setAnimationWeight(a, 1.5))).toMatch(/between 0 and 1/);
    expect(thrown(() => setAnimationWeight(a, -0.1))).toMatch(/between 0 and 1/);
    enablePropertyAnimationBlending(manager);
    a.weight = 2;
    updateAnimationManager(manager, 100);
    expect(target.value).toBe(40);
});
