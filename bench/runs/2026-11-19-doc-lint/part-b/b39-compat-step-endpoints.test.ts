// b-39. Lines 391-392: "STEP segments and clamped first/last endpoints never invoke easing."
// Compat package.
import { Animation, AnimationKeyInterpolation } from "#compat/animations/animation.ts";

test("no ease() call on STEP segments or at or past the first and last keys", () => {
    let calls = 0;
    const easing = { ease: () => (calls++, 0.5) };
    const anim = new Animation("a", "v", 10);
    anim.setEasingFunction(easing);
    anim.setKeys([
        { frame: 5, value: 1, interpolation: AnimationKeyInterpolation.STEP, easingFunction: easing },
        { frame: 10, value: 2 },
        { frame: 20, value: 3, easingFunction: easing },
    ]);
    expect(anim.evaluate(7)).toBe(1);
    expect(anim.evaluate(0)).toBe(1);
    expect(anim.evaluate(5)).toBe(1);
    expect(anim.evaluate(20)).toBe(3);
    expect(anim.evaluate(40)).toBe(3);
    expect(calls).toBe(0);
});
