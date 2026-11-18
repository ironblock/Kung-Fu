import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { constClip } from "./_lib";

it("with property blending, a property gets the plain sum of value x weight once any of its groups has weight other than 1", () => {
    const manager = createAnimationManager();
    const target = { value: 100 };
    const a = createPropertyAnimationGroup(manager, target, constClip("a", 10));
    enablePropertyAnimationBlending(manager);
    setAnimationWeight(a, 0.5);
    updateAnimationManager(manager, 100);
    expect(target.value).toBe(5);

    const b = createPropertyAnimationGroup(manager, target, constClip("b", 20));
    updateAnimationManager(manager, 100);
    expect(target.value).toBe(25);
    setAnimationWeight(b, 0.25);
    updateAnimationManager(manager, 100);
    expect(target.value).toBe(10);
    setAnimationWeight(a, 1);
    setAnimationWeight(b, 1);
    updateAnimationManager(manager, 100);
    expect(target.value).toBe(20);
});
