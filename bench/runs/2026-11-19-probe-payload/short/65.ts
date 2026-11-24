import { expect, test } from "vitest";
import { bezierCurveEase, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("bezierCurveEase with default points, and as a track's easing over a non-looping 1 s track", () => {
    expect([0.1, 0.25, 0.5, 0.9].map((g) => bezierCurveEase(g))).toEqual([0.09999999999999998, 0.25000000000000006, 0.5, 0.8999999999999999]);
    expect(bezierCurveEase(1)).toBe(NaN);
    const seen: number[] = [];
    const easing = (g: number) => (seen.push(g), bezierCurveEase(g));
    const clip = createPropertyAnimationClip("c", [{ path: "v", easing, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const manager = createAnimationManager();
    const target = { v: -1 };
    createPropertyAnimationGroup(manager, target, clip, { loop: false });
    for (let i = 0; i < 4; i++) updateAnimationManager(manager, 500);
    expect(seen).toEqual([0.5]);
    expect(target.v).toBe(10);
});
