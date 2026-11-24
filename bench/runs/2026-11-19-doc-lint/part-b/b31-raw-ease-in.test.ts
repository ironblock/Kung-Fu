// b-31. Line 368: "The functions expose raw ease-in curves."
// Reading: each function is the plain ease-in curve, with no easing-mode argument (mode remapping is
// not in Lite; b-32 checks where it is), running from 0 at gradient 0 to 1 at gradient 1, with its
// default parameters. The bezier curve is tested apart from the other eleven so a fault in one is
// not hidden by the others.
import { backEase, bezierCurveEase, bounceEase, circleEase, cubicEase, elasticEase, exponentialEase, powerEase, quadraticEase, quarticEase, quinticEase, sineEase } from "@babylonjs/lite";

test("eleven curves run from 0 at 0 to 1 at 1", () => {
    for (const fn of [circleEase, quadraticEase, cubicEase, quarticEase, quinticEase, sineEase, powerEase, exponentialEase, backEase, elasticEase, bounceEase] as ((g: number) => number)[]) {
        expect(fn(0)).toBeCloseTo(0, 9);
        expect(fn(1)).toBeCloseTo(1, 9);
    }
});

test("bezierCurveEase with its default control points runs from 0 at 0 to 1 at 1", () => {
    expect(bezierCurveEase(0)).toBe(0);
    expect(bezierCurveEase(1)).toBeCloseTo(1, 9);
});
