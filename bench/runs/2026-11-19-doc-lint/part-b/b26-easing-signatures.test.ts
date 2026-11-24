// b-26. Lines 345-358 (code block): "circleEase(gradient); quadraticEase(gradient); cubicEase(gradient); quarticEase(gradient); quinticEase(gradient); sineEase(gradient); powerEase(gradient, power); exponentialEase(gradient, exponent); backEase(gradient, amplitude); elasticEase(gradient, oscillations, springiness); bounceEase(gradient, bounces, bounciness); bezierCurveEase(gradient, x1, y1, x2, y2);"
// Checked: each name is exported and takes its arguments in the order shown: the closed-form curves
// give their formula, and for bounce and bezier each listed parameter changes the result.
import { backEase, bezierCurveEase, bounceEase, circleEase, cubicEase, elasticEase, exponentialEase, powerEase, quadraticEase, quarticEase, quinticEase, sineEase } from "@babylonjs/lite";

test("the twelve curves exist with the listed parameter order", () => {
    const g = 0.5;
    expect(circleEase(g)).toBeCloseTo(1 - Math.sqrt(0.75), 12);
    expect(quadraticEase(g)).toBe(0.25);
    expect(cubicEase(g)).toBe(0.125);
    expect(quarticEase(g)).toBe(0.0625);
    expect(quinticEase(g)).toBe(0.03125);
    expect(sineEase(g)).toBeCloseTo(1 - Math.sin(Math.PI / 4), 12);
    expect(powerEase(g, 3)).toBe(0.125);
    expect(exponentialEase(g, 4)).toBeCloseTo((Math.exp(2) - 1) / (Math.exp(4) - 1), 12);
    expect(backEase(g, 2)).toBeCloseTo(0.125 - 0.5 * 2 * 1, 12);
    expect(elasticEase(g, 1, 2)).toBeCloseTo(((Math.exp(1) - 1) / (Math.exp(2) - 1)) * Math.sin((2 * Math.PI + Math.PI / 2) * 0.5), 12);
    expect(bounceEase(0.3, 2, 2)).not.toBe(bounceEase(0.3, 4, 2));
    expect(bounceEase(0.3, 3, 2)).not.toBe(bounceEase(0.3, 3, 4));
    const base = bezierCurveEase(0.3, 0.2, 0.1, 0.8, 0.9);
    expect(bezierCurveEase(0.3, 0.4, 0.1, 0.8, 0.9)).not.toBe(base);
    expect(bezierCurveEase(0.3, 0.2, 0.5, 0.8, 0.9)).not.toBe(base);
    expect(bezierCurveEase(0.3, 0.2, 0.1, 0.5, 0.9)).not.toBe(base);
    expect(bezierCurveEase(0.3, 0.2, 0.1, 0.8, 0.2)).not.toBe(base);
});
