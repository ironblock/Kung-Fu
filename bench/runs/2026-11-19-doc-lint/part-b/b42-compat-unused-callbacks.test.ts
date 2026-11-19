// b-42. Lines 396-397: "A final key's callback and callbacks on STEP segments are unused and do not force fallback."
// Compat package.
import { createAnimationManager } from "@babylonjs/lite";
import { Animatable, Animation, AnimationKeyInterpolation } from "#compat/animations/animation.ts";

test("callbacks on the final key or on STEP keys leave the track native", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const easing = { ease: () => 0.5 };
    const anim = new Animation("a", "v", 10);
    anim.setKeys([
        { frame: 0, value: 0, interpolation: AnimationKeyInterpolation.STEP, easingFunction: easing },
        { frame: 5, value: 5, interpolation: AnimationKeyInterpolation.STEP, easingFunction: easing },
        { frame: 10, value: 10, easingFunction: easing },
    ]);
    const animatable = Animatable._create(() => manager, target, [anim], 0, 10, true, 1);
    expect(animatable._nativeFallbackReason).toBeUndefined();
    expect(animatable._lite).toBeDefined();
});
