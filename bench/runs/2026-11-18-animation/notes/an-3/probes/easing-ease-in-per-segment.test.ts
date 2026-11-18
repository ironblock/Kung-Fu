import { expect, it } from "vitest";
import {
    backEase, bounceEase, circleEase, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, cubicEase, elasticEase, exponentialEase,
    powerEase, quadraticEase, quarticEase, quinticEase, sineEase, updateAnimationManager,
} from "@babylonjs/lite";

it("easing functions other than bezierCurveEase are ease-in; 1 - f(1 - g) eases out; a track's easing reshapes each key-to-key segment", () => {
    for (const f of [quadraticEase, cubicEase, quarticEase, quinticEase, sineEase, circleEase, powerEase, exponentialEase, backEase, elasticEase, bounceEase]) {
        expect(f(0), f.name).toBeCloseTo(0);
        expect(f(1), f.name).toBeCloseTo(1);
        expect(f(0.25), f.name).toBeLessThan(0.25);
        expect(f(0.75), f.name).toBeLessThan(0.75);
    }
    const manager = createAnimationManager();
    const target = { v: 0, o: 0 };
    const easeOut = (g: number) => 1 - quadraticEase(1 - g);
    const clip = createPropertyAnimationClip("c", [
        { path: "v", easing: quadraticEase, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 2, value: 20 }] },
        { path: "o", easing: easeOut, keys: [{ time: 0, value: 0 }, { time: 2, value: 20 }] },
    ]);
    createPropertyAnimationGroup(manager, target, clip, { loop: false });
    updateAnimationManager(manager, 500);
    expect(target.v).toBeCloseTo(2.5);
    expect(target.o).toBeCloseTo(20 * (1 - 0.75 * 0.75));
    updateAnimationManager(manager, 1000);
    expect(target.v).toBeCloseTo(12.5);
    expect(target.o).toBeCloseTo(20 * (1 - 0.25 * 0.25));
});
