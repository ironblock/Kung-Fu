// c-103. Lines 716-718: "Per-key easing is implemented by this same compat evaluator; animation-level-only tracks retain
// the native delegation described above."
// Compat package. Checked: a track with a per-key easing is not delegated and is eased per key by compat (2.5 at the
// middle with g*g); a track with only animation-level easing is delegated and eased by Lite (2.5 too).
import { anim, frame, makeScene, ramp, square } from "./_compat";

test("per-key on compat, animation-level on Lite", () => {
    const scene = makeScene();
    const perKey = { v: -1 };
    const p = scene.beginDirectAnimation(perKey, [anim("v", [{ frame: 0, value: 0, easingFunction: square }, { frame: 10, value: 10 }])], 0, 10, true);
    const level = { v: -1 };
    const a = ramp();
    a.setEasingFunction(square);
    const l = scene.beginDirectAnimation(level, [a], 0, 10, true);
    expect(p._lite).toBeUndefined();
    expect(l._lite).toBeDefined();
    frame(scene, 500);
    expect(perKey.v).toBeCloseTo(2.5, 5);
    expect(level.v).toBeCloseTo(2.5, 5);
});
