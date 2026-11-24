import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("keys listed out of order on two tracks of 1 s and 3 s, and a key at -1 s", () => {
    const clip = createPropertyAnimationClip("c", [
        { path: "a", keys: [{ time: 1, value: 10 }, { time: 0, value: 0 }] },
        { path: "b", keys: [{ time: 3, value: 30 }, { time: 0, value: 0 }] },
    ]);
    expect(Array.from(clip.tracks[0]!.sampler.input)).toEqual([0, 1]);
    expect(Array.from(clip.tracks[0]!.sampler.output)).toEqual([0, 10]);
    expect(clip.duration).toBe(3);
    expect(() => createPropertyAnimationClip("n", [{ path: "a", keys: [{ time: -1, value: 0 }] }])).toThrow("must have a non-negative time");
    const manager = createAnimationManager();
    const target = { a: -1, b: -1 };
    createPropertyAnimationGroup(manager, target, clip, { loop: false });
    updateAnimationManager(manager, 2000);
    expect(target).toEqual({ a: 10, b: 20 });
});
