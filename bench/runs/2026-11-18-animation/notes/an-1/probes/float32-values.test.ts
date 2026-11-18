// Note: key values and times go through Float32Array, so written numbers are float32-rounded.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

it("rounds to float32", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0.1 }, { time: 0.3, value: 0.1 }] }]);
    expect(clip.duration).toBe(Math.fround(0.3));
    expect(clip.duration).not.toBe(0.3);
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 10);
    expect(target.v).toBe(0.10000000149011612);
    expect(target.v === 0.1).toBe(false);
});
