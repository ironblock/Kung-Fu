import { expect, test } from "vitest";
import * as Lite from "@babylonjs/lite";
import { backEase, bezierCurveEase, bounceEase, circleEase, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, cubicEase, elasticEase, exponentialEase, powerEase, quadraticEase, quarticEase, quinticEase, sineEase, updateAnimationManager } from "@babylonjs/lite";

test("the built-in easings at 0.25 and 0.5, an eased three-key track, and a hand-made easing", () => {
    const curves = [circleEase, quadraticEase, cubicEase, quarticEase, quinticEase, sineEase, powerEase, exponentialEase, backEase, elasticEase, bounceEase];
    expect(curves.filter((f) => !(f(0.25) < 0.25 && f(0.5) < 0.5))).toEqual([]);
    expect(bezierCurveEase(0.5)).toBe(0.5);
    expect(Object.keys(Lite).filter((k) => /EasingMode|EaseOut|EaseInOut/i.test(k))).toEqual([]);
    const manager = createAnimationManager();
    const target = { v: 0, w: 0 };
    const clip = createPropertyAnimationClip("e", [
        { path: "v", easing: quadraticEase, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 2, value: 20 }] },
        { path: "w", easing: (g) => 1 - cubicEase(1 - g), keys: [{ time: 0, value: 0 }, { time: 2, value: 20 }] },
    ]);
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 500);
    expect(target).toEqual({ v: 2.5, w: 11.5625 });
    updateAnimationManager(manager, 1000);
    expect(target.v).toBe(12.5);
});
