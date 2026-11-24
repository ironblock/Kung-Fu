import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationGroup, enableAnimationBlending, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { constClip } from "./_lib";

it("the last of enablePropertyAnimationBlending and enableAnimationBlending wins; under the latter property weights are ignored", () => {
    const manager = createAnimationManager();
    const target = { value: 0 };
    const a = createPropertyAnimationGroup(manager, target, constClip("a", 10));
    const b = createPropertyAnimationGroup(manager, target, constClip("b", 20));
    setAnimationWeight(a, 0.5);
    setAnimationWeight(b, 0.5);
    enablePropertyAnimationBlending(manager);
    updateAnimationManager(manager, 10);
    expect(target.value).toBe(15);
    enableAnimationBlending(manager);
    updateAnimationManager(manager, 10);
    expect(target.value).toBe(20);
    enablePropertyAnimationBlending(manager);
    updateAnimationManager(manager, 10);
    expect(target.value).toBe(15);
});
