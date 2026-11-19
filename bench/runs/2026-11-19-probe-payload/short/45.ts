import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, quadraticEase, updateAnimationManager } from "@babylonjs/lite";

test("a step track with quadraticEase keyed 1, 2, 3 at 0, 1, 2 s, updated in steps of 0, 500, 499, 1, 999, 1 ms", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [
        { path: "v", interpolation: "step", easing: quadraticEase, keys: [{ time: 0, value: 1 }, { time: 1, value: 2 }, { time: 2, value: 3 }] },
    ]);
    createPropertyAnimationGroup(manager, target, clip, { loop: false });
    const seen: number[] = [];
    for (const ms of [0, 500, 499, 1, 999, 1]) {
        updateAnimationManager(manager, ms);
        seen.push(target.v);
    }
    expect(seen).toEqual([1, 1, 1, 2, 2, 3]);
});
