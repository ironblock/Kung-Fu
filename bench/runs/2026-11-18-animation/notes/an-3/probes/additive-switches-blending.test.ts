import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationAdditive, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { constClip, thrown } from "./_lib";

it("setAnimationAdditive on a group in a manager calls enableAnimationBlending on it, ending property blending", () => {
    const manager = createAnimationManager();
    const target = { value: 0 };
    const a = createPropertyAnimationGroup(manager, target, constClip("a", 10));
    const b = createPropertyAnimationGroup(manager, target, constClip("b", 20));
    setAnimationWeight(a, 0.5);
    setAnimationWeight(b, 0.5);
    enablePropertyAnimationBlending(manager);
    updateAnimationManager(manager, 10);
    expect(target.value).toBe(15);
    setAnimationAdditive(a);
    updateAnimationManager(manager, 10);
    expect(target.value).toBe(20);
    expect(thrown(() => setAnimationAdditive(a, { referenceFrame: 1, referenceTime: 0 }))).toMatch(/not both/);
});
