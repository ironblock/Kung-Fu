// c-94. Lines 695-696: "The native easing adapter reads `Animation.getEasingFunction()` at sample time, so replacing or
// clearing animation-level easing remains live."
// Compat package. Checked on a delegated track at 0.5 s: eased by g*g it writes 2.5; after setEasingFunction(g^3) the
// next frame writes 1.25; after setEasingFunction(null) the next frame writes 5. (Frames of 0 ms keep the time.)
import { frame, makeScene, ramp, square } from "./_compat";

test("easing changes take effect on the next sample", () => {
    const scene = makeScene();
    const target = { v: -1 };
    const a = ramp();
    a.setEasingFunction(square);
    const animatable = scene.beginDirectAnimation(target, [a], 0, 10, true);
    expect(animatable._lite).toBeDefined();
    frame(scene, 500);
    expect(target.v).toBeCloseTo(2.5, 5);
    a.setEasingFunction({ ease: (g: number) => g * g * g });
    frame(scene, 0);
    expect(target.v).toBeCloseTo(1.25, 5);
    a.setEasingFunction(null);
    frame(scene, 0);
    expect(target.v).toBeCloseTo(5, 5);
});
