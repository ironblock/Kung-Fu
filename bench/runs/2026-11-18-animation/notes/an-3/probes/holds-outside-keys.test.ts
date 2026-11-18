import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

it("before its first key a track writes the first key's value; after its last key, the last key's value", () => {
    const manager = createAnimationManager();
    const target = { a: 0, b: 0 };
    const clip = createPropertyAnimationClip("c", [
        { path: "a", keys: [{ time: 1, value: 10 }, { time: 2, value: 20 }] },
        { path: "b", keys: [{ time: 0, value: 0 }, { time: 0.5, value: 5 }] },
    ]);
    createPropertyAnimationGroup(manager, target, clip, { loop: false });
    updateAnimationManager(manager, 0);
    expect(target.a).toBe(10);
    updateAnimationManager(manager, 1500);
    expect(target.a).toBe(15);
    expect(target.b).toBe(5);
});
