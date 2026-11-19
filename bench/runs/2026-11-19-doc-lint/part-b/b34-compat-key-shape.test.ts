// b-34. Lines 374-376 and the interface at 378-383: "The compat keyframe model additionally accepts Babylon.js-shaped per-key easing:" interface IAnimationKey { frame: number; value: AnimationValue; interpolation?: number; easingFunction?: IEasingFunction; }
// Compat package. Checked: Animation.setKeys takes keys with those four fields, keeps them, and
// evaluate() uses a key's easingFunction and interpolation.
import { Animation, AnimationKeyInterpolation } from "#compat/animations/animation.ts";

test("compat keys carry frame, value, interpolation and easingFunction", () => {
    const easing = { ease: (g: number) => g * g };
    const anim = new Animation("a", "v", 10);
    anim.setKeys([
        { frame: 0, value: 0, easingFunction: easing },
        { frame: 10, value: 10, interpolation: AnimationKeyInterpolation.STEP },
        { frame: 20, value: 20 },
    ]);
    const keys = anim.getKeys();
    expect(keys[0]!.easingFunction).toBe(easing);
    expect(keys[1]!.interpolation).toBe(AnimationKeyInterpolation.STEP);
    expect(anim.evaluate(5)).toBe(2.5);
    expect(anim.evaluate(15)).toBe(10);
});
