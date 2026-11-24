import * as lite from "@babylonjs/lite";
import {
    backEase,
    bezierCurveEase,
    bounceEase,
    circleEase,
    cubicEase,
    elasticEase,
    exponentialEase,
    powerEase,
    quadraticEase,
    quarticEase,
    quinticEase,
    sineEase,
} from "@babylonjs/lite";

test("every easing function is the ease-in curve: f(0) = 0, f(1) = 1, and it is slow at the start", () => {
    const fns = [backEase, bounceEase, circleEase, cubicEase, elasticEase, exponentialEase, powerEase, quadraticEase, quarticEase, quinticEase, sineEase];
    for (const f of fns) {
        expect(f(0), f.name).toBeCloseTo(0, 6);
        expect(f(1), f.name).toBeCloseTo(1, 6);
    }
    expect(quadraticEase(0.25)).toBe(0.0625);
    expect(cubicEase(0.5)).toBe(0.125);
    expect(quarticEase(0.5)).toBe(0.0625);
    expect(quinticEase(0.5)).toBe(0.03125);
    expect(sineEase(0.5)).toBeCloseTo(1 - Math.SQRT1_2, 10);
    expect(circleEase(0.5)).toBeCloseTo(1 - Math.sqrt(0.75), 10);
    expect(bezierCurveEase(0)).toBe(0);
    expect(bezierCurveEase(0.5, 0.42, 0, 1, 1)).toBeLessThan(0.5);
    expect(bezierCurveEase(1, 0.42, 0, 1, 1)).toBeCloseTo(1, 6);
});



test("the library has no easing mode and no ease-out or ease-in-out functions", () => {
    const names = Object.keys(lite);
    expect(names.filter((n) => /EasingMode|EaseOut|EaseInOut|easeOut|easeInOut/.test(n))).toEqual([]);
});

test("defaults: powerEase 2, exponentialEase 2, backEase 1, elasticEase (3, 3), bounceEase (3, 2), bezierCurveEase (0, 0, 1, 1)", () => {
    for (const g of [0.1, 0.3, 0.5, 0.7, 0.9]) {
        expect(powerEase(g)).toBe(powerEase(g, 2));
        expect(powerEase(g)).toBeCloseTo(g * g, 12);
        expect(exponentialEase(g)).toBe(exponentialEase(g, 2));
        expect(backEase(g)).toBe(backEase(g, 1));
        expect(elasticEase(g)).toBe(elasticEase(g, 3, 3));
        expect(bounceEase(g)).toBe(bounceEase(g, 3, 2));
        expect(bezierCurveEase(g)).toBe(bezierCurveEase(g, 0, 0, 1, 1));
    }
});
