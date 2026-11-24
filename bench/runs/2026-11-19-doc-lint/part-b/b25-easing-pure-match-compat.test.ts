// b-25. Lines 342-343: "Lite exports pure ease-in functions that match the curve math used by the compat layer:"
// Checked: the twelve functions are exported; each gives the same output for the same input on repeat
// calls (no hidden state); and each equals the compat package's matching class in its default
// (ease-in) mode, with default parameters.
import * as lite from "@babylonjs/lite";
import * as compat from "#compat/animations/easing.ts";

const pairs: [keyof typeof lite, keyof typeof compat][] = [
    ["circleEase", "CircleEase"],
    ["quadraticEase", "QuadraticEase"],
    ["cubicEase", "CubicEase"],
    ["quarticEase", "QuarticEase"],
    ["quinticEase", "QuinticEase"],
    ["sineEase", "SineEase"],
    ["powerEase", "PowerEase"],
    ["exponentialEase", "ExponentialEase"],
    ["backEase", "BackEase"],
    ["elasticEase", "ElasticEase"],
    ["bounceEase", "BounceEase"],
    ["bezierCurveEase", "BezierCurveEase"],
];

test("each exported curve is repeatable and equals the compat ease-in class", () => {
    for (const [fnName, className] of pairs) {
        const fn = lite[fnName] as unknown as (g: number) => number;
        expect(typeof fn).toBe("function");
        const Klass = compat[className] as unknown as new () => { ease(g: number): number };
        const eased = new Klass();
        for (const g of [0, 0.1, 0.33, 0.5, 0.77, 1]) {
            const first = fn(g);
            expect(fn(g)).toBe(first);
            expect(eased.ease(g)).toBe(first);
        }
    }
});
