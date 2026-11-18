import { bezierCurveEase, createAnimationManager, createBezierCurveEase, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("bezierCurveEase with its default points is linear inside (0, 1), but bezierCurveEase(1) returns NaN", () => {
    for (const g of [0.1, 0.25, 0.5, 0.75, 0.9, 0.999]) {
        expect(bezierCurveEase(g)).toBeCloseTo(g, 2);
    }
    expect(bezierCurveEase(0.5)).toBe(0.5);
    expect(bezierCurveEase(1)).toBeNaN();
    expect(createBezierCurveEase()(1)).toBeNaN();
});

test("a track eased by the default bezier never receives gradient 1: at the last key the last value is copied", () => {
    const seen: number[] = [];
    const ease = createBezierCurveEase();
    const clip = createPropertyAnimationClip("c", [
        { path: "v", easing: (g) => (seen.push(g), ease(g)), keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 2, value: 20 }] },
    ]);
    const manager = createAnimationManager();
    const target = { v: 0 };
    createPropertyAnimationGroup(manager, target, clip, { loop: false });
    for (let i = 0; i < 30; i++) {
        updateAnimationManager(manager, 100);
        expect(Number.isNaN(target.v)).toBe(false);
    }
    expect(target.v).toBe(20);
    expect(seen.every((g) => g >= 0 && g < 1)).toBe(true);
});
