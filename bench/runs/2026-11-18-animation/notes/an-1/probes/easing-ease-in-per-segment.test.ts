// Note: the built-in easings are ease-in and there is no easing mode; (g) => 1 - cubicEase(1 - g) gives ease-out; easing reshapes each span between two keys.
import { expect, it } from "vitest";
import * as Lite from "@babylonjs/lite";
import { backEase, bounceEase, circleEase, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, cubicEase, elasticEase, exponentialEase, powerEase, quadraticEase, quarticEase, quinticEase, sineEase, updateAnimationManager } from "@babylonjs/lite";

it("ease-in curves, no mode", () => {
    const curves = { circleEase, quadraticEase, cubicEase, quarticEase, quinticEase, sineEase, powerEase, exponentialEase, backEase, elasticEase, bounceEase };
    for (const [name, f] of Object.entries(curves)) {
        // Ease-in: the curve lies mostly below the straight line, so its mean over 0..1 is under 0.5,
        // and its first tenth moves less than its last tenth.
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
            sum += f((i + 0.5) / 1000);
        }
        expect(sum / 1000, name).toBeLessThan(0.5);
        expect(Math.abs(f(0.1) - f(0)), name).toBeLessThan(Math.abs(f(1) - f(0.9)));
        expect(f(0), name).toBeCloseTo(0, 9);
        expect(f(1), name).toBeCloseTo(1, 9);
    }
    expect(Object.keys(Lite).filter((k) => /EasingMode|easeOut|EaseOut|easeInOut|EaseInOut/i.test(k))).toEqual([]);
});

it("per span, and ease-out by hand", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("e", [{ path: "v", easing: quadraticEase, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 2, value: 20 }] }]));
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(2.5);
    updateAnimationManager(manager, 1000);
    expect(target.v).toBe(12.5);
    const out = { v: 0 };
    createPropertyAnimationGroup(manager, out, createPropertyAnimationClip("o", [{ path: "v", easing: (g) => 1 - cubicEase(1 - g), keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    updateAnimationManager(manager, 500);
    expect(out.v).toBe(8.75);
});
