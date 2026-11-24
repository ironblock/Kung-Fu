// c-82. Lines 664-665: "Compat partitions a direct-animation call into a native subset and an explicit fallback subset."
// Compat package. Checked: one call with a supported track "a" and a per-key-eased track "b" gives one Animatable with
// a Lite group for "a" only, a fallback reason naming "b" only, and both properties animated after a frame.
import { anim, frame, makeScene, ramp, square } from "./_compat";

test("native subset plus fallback subset", () => {
    const scene = makeScene();
    const target = { a: -1, b: -1 };
    const b = anim("b", [{ frame: 0, value: 0, easingFunction: square }, { frame: 10, value: 10 }]);
    const animatable = scene.beginDirectAnimation(target, [ramp("a"), b], 0, 10, true);
    expect(animatable._lite!.targetedAnimations.map((t) => t.path)).toEqual(["a"]);
    expect(animatable._nativeFallbackReason).toMatch(/"b"/);
    expect(animatable._nativeFallbackReason).not.toMatch(/"a"/);
    frame(scene, 500);
    expect(target.a).toBeCloseTo(5, 5);
    expect(target.b).toBeCloseTo(2.5, 5);
});
