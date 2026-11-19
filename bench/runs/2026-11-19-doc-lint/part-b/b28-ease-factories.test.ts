// b-28. Lines 361-364: "Parameterized curves also provide `createPowerEase`, `createExponentialEase`, `createBackEase`, `createElasticEase`, `createBounceEase`, and `createBezierCurveEase`, which capture parameters and return an `AnimationEasing` callback."
import {
    backEase,
    bezierCurveEase,
    bounceEase,
    createAnimationManager,
    createBackEase,
    createBezierCurveEase,
    createBounceEase,
    createElasticEase,
    createExponentialEase,
    createPowerEase,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    elasticEase,
    exponentialEase,
    goToFrame,
    powerEase,
} from "@babylonjs/lite";

test("each factory returns a one-argument callback with its parameters fixed", () => {
    const cases: [(g: number) => number, (g: number) => number][] = [
        [createPowerEase(3), (g) => powerEase(g, 3)],
        [createExponentialEase(4), (g) => exponentialEase(g, 4)],
        [createBackEase(2), (g) => backEase(g, 2)],
        [createElasticEase(2, 5), (g) => elasticEase(g, 2, 5)],
        [createBounceEase(4, 3), (g) => bounceEase(g, 4, 3)],
        [createBezierCurveEase(0.2, 0.1, 0.8, 0.9), (g) => bezierCurveEase(g, 0.2, 0.1, 0.8, 0.9)],
    ];
    for (const [made, direct] of cases) {
        expect(typeof made).toBe("function");
        for (const g of [0, 0.25, 0.5, 0.9, 1]) {
            expect(made(g)).toBe(direct(g));
        }
    }
    const target = { v: -1 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", easing: createPowerEase(3), keys: [{ time: 0, value: 0 }, { time: 1, value: 8 }] }], { frameRate: 2 });
    goToFrame(createPropertyAnimationGroup(createAnimationManager(), target, clip), 1);
    expect(target.v).toBe(1);
});
