import { backEase, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, quadraticEase } from "@babylonjs/lite";

function valueAt(track: Parameters<typeof createPropertyAnimationClip>[1][number], seconds: number): number {
    const clip = createPropertyAnimationClip("c", [track]);
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    goToFrame(group, seconds * group.frameRate!);
    return target.v;
}

test("easing is applied to the 0..1 progress inside each pair of keys, not over the whole clip", () => {
    const track = { path: "v", frameRate: 1, easing: quadraticEase, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 2, value: 20 }] };
    expect(valueAt(track, 0.5)).toBeCloseTo(2.5, 5);
    expect(valueAt(track, 1)).toBe(10);
    expect(valueAt(track, 1.5)).toBeCloseTo(12.5, 5);
});

test("easing is not applied to step tracks", () => {
    let calls = 0;
    const track = {
        path: "v",
        frameRate: 1,
        interpolation: "step" as const,
        easing: (g: number) => (calls++, g),
        keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }],
    };
    expect(valueAt(track, 0.5)).toBe(0);
    expect(calls).toBe(0);
});

test("easing results outside 0..1 are not clamped: backEase dips below the first key", () => {
    const track = { path: "v", frameRate: 1, easing: backEase, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] };
    const v = valueAt(track, 0.3);
    expect(v).toBeLessThan(0);
    expect(v).toBeCloseTo(10 * backEase(0.3), 4);
});
