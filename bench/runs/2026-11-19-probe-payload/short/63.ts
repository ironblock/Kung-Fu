import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

test("track sizes from keys of several shapes, listed out of time order, then a size-5 clip bound to a target", () => {
    const clip = (...values: (number | number[])[]) => createPropertyAnimationClip("c", [{ path: "p", keys: values.map((value, i) => ({ time: values.length - 1 - i, value })) }]);
    expect(clip(4, 5).tracks[0]!.stride).toBe(1);
    expect(clip([4], 5).tracks[0]!.stride).toBe(1);
    expect(clip([1, 2, 3], [4, 5, 6]).tracks[0]!.stride).toBe(3);
    expect(() => clip([1, 2], [1, 2, 3])).toThrow('Animation key for "p" expected 2 values');
    expect(() => clip([1, 2, 3], [1, 2])).toThrow('Animation key for "p" expected 3 values');
    expect(() => clip(1, [1, 2])).toThrow('Animation key for "p" expected 1 values');
    const five = clip([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
    expect(five.tracks[0]!.stride).toBe(5);
    expect(() => createPropertyAnimationGroup(createAnimationManager(), { p: { x: 0 } }, five)).toThrow(
        'Animation property path "p" has unsupported vector size 5');
});
