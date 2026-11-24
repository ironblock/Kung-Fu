// c-97. Lines 702-705: "Compat temporarily retains its existing CPU evaluator for explicitly unsupported tracks: per-key
// easing, mixed per-key STEP/LINEAR segments, matrix/color/custom data shapes, relative/constant loop modes, unresolved
// or non-native property bindings, and tracks whose key domain cannot represent the requested forward play range."
// Compat package. Checked: each named kind of track, alone in a call, is not delegated (no Lite group) and is still
// animated by the compat evaluator on the next frame.
import { anim, AnimationKeyInterpolation, AnimationLoopModes, AnimationTypes, frame, makeScene, square } from "./_compat";

const k = (a: number, b: number) => [{ frame: 0, value: a }, { frame: 10, value: b }];
const cases: [string, () => { target: Record<string, unknown>; a: ReturnType<typeof anim>; check: (t: Record<string, unknown>) => boolean }][] = [
    ["per-key easing", () => ({ target: { v: -1 }, a: anim("v", [{ frame: 0, value: 0, easingFunction: square }, { frame: 10, value: 10 }]), check: (t) => t.v === 2.5 })],
    ["mixed STEP/LINEAR", () => ({ target: { v: -1 }, a: anim("v", [{ frame: 0, value: 0, interpolation: AnimationKeyInterpolation.STEP }, { frame: 4, value: 4 }, { frame: 10, value: 10 }]), check: (t) => t.v === 5 })],
    ["color data", () => ({ target: { c: [0, 0, 0] }, a: anim("c", [{ frame: 0, value: [0, 0, 0] }, { frame: 10, value: [1, 1, 1] }], 10, AnimationTypes.ANIMATIONTYPE_COLOR3), check: (t) => (t.c as number[])[0] === 0.5 })],
    ["relative loop", () => ({ target: { v: -1 }, a: anim("v", k(0, 10), 10, 0, AnimationLoopModes.ANIMATIONLOOPMODE_RELATIVE), check: (t) => t.v === 5 })],
    ["constant loop", () => ({ target: { v: -1 }, a: anim("v", k(0, 10), 10, 0, AnimationLoopModes.ANIMATIONLOOPMODE_CONSTANT), check: (t) => t.v === 5 })],
    ["non-native binding", () => ({ target: { p: { x: 0, y: 0, z: 0 } }, a: anim("p", [{ frame: 0, value: [0, 0, 0] }, { frame: 10, value: [2, 2, 2] }], 10, AnimationTypes.ANIMATIONTYPE_VECTOR3), check: (t) => (t.p as number[])[0] === 1 })],
    ["range outside keys", () => ({ target: { v: -1 }, a: anim("v", [{ frame: 0, value: 0 }, { frame: 6, value: 6 }]), check: (t) => t.v === 5 })],
];

test.each(cases)("%s: compat evaluator", (_name, make) => {
    const scene = makeScene();
    const { target, a } = make();
    const animatable = scene.beginDirectAnimation(target, [a], 0, 10, true);
    expect(animatable._lite).toBeUndefined();
    frame(scene, 500);
    expect(make().check(target)).toBe(true);
});
