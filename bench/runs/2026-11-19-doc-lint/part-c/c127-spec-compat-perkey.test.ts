// c-127. Line 757: "**Compat per-key easing**: Verify start-key precedence, default/linear fallback, STEP and final-key
// callback bypass, scalar/vector/quaternion values, structural groups, and mixed native/compat playback"
// Compat package. Checked with Animation.evaluate and a scene: the start key's easing is used for its segment over the
// animation's; a key without one uses the animation's, or linear when there is none; a STEP key's and the final key's
// easing are never called; per-key easing works on scalar, vector and quaternion values, in a structural group, and next
// to a delegated track in one call.
import { anim, AnimationGroup, AnimationKeyInterpolation, AnimationTypes, frame, makeScene, ramp, square, Vector3 } from "./_compat";
import { Quaternion } from "#compat/math/quaternion.ts";

test("per-key easing rules", () => {
    let finalCalls = 0;
    let stepCalls = 0;
    const cube = { ease: (g: number) => g * g * g };
    const a = anim("v", [
        { frame: 0, value: 0, easingFunction: square },
        { frame: 10, value: 10 },
        { frame: 20, value: 20, interpolation: AnimationKeyInterpolation.STEP, easingFunction: { ease: (g: number) => (stepCalls++, g) } },
        { frame: 30, value: 30 },
        { frame: 40, value: 40, easingFunction: { ease: (g: number) => (finalCalls++, g) } },
    ]);
    a.setEasingFunction(cube);
    expect(a.evaluate(5)).toBeCloseTo(2.5, 6);
    expect(a.evaluate(15)).toBeCloseTo(11.25, 6);
    expect(a.evaluate(25)).toBe(20);
    expect(a.evaluate(35)).toBeCloseTo(31.25, 6);
    a.setEasingFunction(null);
    expect(a.evaluate(15)).toBeCloseTo(15, 6);
    expect(a.evaluate(40)).toBe(40);
    expect(a.evaluate(45)).toBe(40);
    expect([stepCalls, finalCalls]).toEqual([0, 0]);

    const v = anim("position", [{ frame: 0, value: new Vector3(0, 0, 0), easingFunction: square }, { frame: 10, value: new Vector3(10, 10, 10) }], 10, AnimationTypes.ANIMATIONTYPE_VECTOR3);
    expect((v.evaluate(5) as Vector3).x).toBeCloseTo(2.5, 6);
    const q = anim("q", [{ frame: 0, value: new Quaternion(0, 0, 0, 1), easingFunction: square }, { frame: 10, value: new Quaternion(0, 0, 1, 0) }], 10, AnimationTypes.ANIMATIONTYPE_QUATERNION);
    expect((q.evaluate(5) as Quaternion).z).toBeCloseTo(Math.sin(Math.PI / 8), 5);

    const scene = makeScene();
    const s = { v: -1 };
    const group = new AnimationGroup("g", scene);
    group.addTargetedAnimation(anim("v", [{ frame: 0, value: 0, easingFunction: square }, { frame: 10, value: 10 }]), s);
    group.start(true);
    const mixed = { v: -1, w: -1 };
    const m = scene.beginDirectAnimation(mixed, [ramp("v"), anim("w", [{ frame: 0, value: 0, easingFunction: square }, { frame: 10, value: 10 }])], 0, 10, true);
    expect(m._lite).toBeDefined();
    frame(scene, 500);
    expect(s.v).toBeCloseTo(2.5, 5);
    expect(mixed).toEqual({ v: expect.closeTo(5, 5), w: expect.closeTo(2.5, 5) });
});
