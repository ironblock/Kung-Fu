// b-32. Lines 368-370: "Babylon.js easing modes remain a compat facade concern: `EasingFunction.ease()` remaps the input/output for ease-out and ease-in-out, then delegates the raw curve calculation to Lite."
// Compat package. Checked: Lite exports no easing-mode names; compat ease() in EASEOUT is
// 1 - curve(1 - g), in EASEINOUT is the halves of the curve, and the curve is Lite's function.
import * as lite from "@babylonjs/lite";
import { EasingFunction, QuadraticEase } from "#compat/animations/easing.ts";

test("modes live in compat; the raw curve is Lite's", () => {
    expect(Object.keys(lite).filter((k) => /easingmode|EasingFunction/i.test(k))).toEqual([]);
    const q = new QuadraticEase();
    q.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
    expect(q.ease(0.25)).toBe(1 - lite.quadraticEase(0.75));
    q.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    expect(q.ease(0.25)).toBe(lite.quadraticEase(0.5) * 0.5);
    expect(q.ease(0.75)).toBe(1 - lite.quadraticEase(0.5) * 0.5);
});
