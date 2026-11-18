import { expect, it } from "vitest";
import { backEase, bezierCurveEase, createAnimationManager, createBezierCurveEase, createPropertyAnimationClip, createPropertyAnimationGroup, elasticEase, updateAnimationManager } from "@babylonjs/lite";

it("eased values are not clamped and tracks write the overshoot; bezierCurveEase(1) with default points is NaN", () => {
    const manager = createAnimationManager();
    const target = { back: 0, elastic: 0 };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [
        { path: "back", easing: backEase, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] },
        { path: "elastic", easing: elasticEase, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] },
    ]));
    updateAnimationManager(manager, 300);
    expect(target.back).toBeLessThan(0);
    expect(target.elastic).toBeLessThan(0);
    expect(bezierCurveEase(1)).toBeNaN();
    expect(createBezierCurveEase(0.42, 0, 0.58, 1)(1)).toBe(1);
});
