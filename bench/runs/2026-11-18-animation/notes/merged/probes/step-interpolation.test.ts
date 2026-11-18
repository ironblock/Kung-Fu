import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, quadraticEase, updateAnimationManager } from "@babylonjs/lite";

it("a step track writes each key's value from its time until the next key's time; easing is not used", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [
        { path: "v", interpolation: "step", easing: quadraticEase, keys: [{ time: 0, value: 1 }, { time: 1, value: 2 }, { time: 2, value: 3 }] },
    ]);
    createPropertyAnimationGroup(manager, target, clip, { loop: false });
    const seen: number[] = [];
    for (const step of [0, 500, 499, 1, 999, 1]) {
        updateAnimationManager(manager, step);
        seen.push(target.v);
    }
    expect(seen).toEqual([1, 1, 1, 2, 2, 3]);
});
