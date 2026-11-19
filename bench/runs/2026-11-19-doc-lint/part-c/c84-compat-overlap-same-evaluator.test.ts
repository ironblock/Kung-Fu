// c-84. Lines 666-668: "Tracks whose dotted property paths overlap (for example `position` and `position.x`) stay on
// the same evaluator so write ordering cannot change."
// Compat package. Checked with the sentence's example: "position" is unsupported (per-key easing) and "position.x" is
// supported alone; in one call both go to the fallback, and the reason says the second overlaps.
import { anim, AnimationTypes, makeScene, square, Vector3 } from "./_compat";

test("position and position.x stay together", () => {
    const scene = makeScene();
    const target = { position: new Vector3(0, 0, 0) };
    const whole = anim("position", [{ frame: 0, value: [0, 0, 0], easingFunction: square }, { frame: 10, value: [1, 1, 1] }], 10, AnimationTypes.ANIMATIONTYPE_VECTOR3);
    const x = anim("position.x", [{ frame: 0, value: 0 }, { frame: 10, value: 5 }]);
    const animatable = scene.beginDirectAnimation(target, [whole, x], 0, 10, true);
    expect(animatable._lite).toBeUndefined();
    expect(animatable._nativeFallbackReason).toMatch(/position\.x" overlaps/);
});
