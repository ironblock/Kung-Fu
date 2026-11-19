// c-90. Lines 678-681: "Completion is derived from the native group's stopped state together with the fallback subset's
// per-track state rather than reconstructing an endpoint from floating-point time."
// Compat package. Internal design; its effect is checked: a non-looping call with a delegated track and a fallback track
// (per-key easing) completes once, on the frame both reach frame 10, and not before. Frame steps of 1000/3 ms reach the
// end through floating-point sums.
import { anim, frame, makeScene, ramp, square } from "./_compat";

test("completion once, when both subsets end", () => {
    const scene = makeScene();
    const target = { a: -1, b: -1 };
    let ended = 0;
    const b = anim("b", [{ frame: 0, value: 0, easingFunction: square }, { frame: 10, value: 10 }]);
    const animatable = scene.beginDirectAnimation(target, [ramp("a"), b], 0, 10, false, 1, () => void ended++);
    expect(animatable._lite).toBeDefined();
    frame(scene, 1000 / 3);
    frame(scene, 1000 / 3);
    expect(ended).toBe(0);
    frame(scene, 1000 / 3);
    expect(ended).toBe(1);
    expect(target).toEqual({ a: 10, b: 10 });
    frame(scene, 500);
    expect(ended).toBe(1);
});
