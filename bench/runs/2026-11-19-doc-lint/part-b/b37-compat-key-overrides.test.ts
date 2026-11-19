// b-37. Lines 389-390: "Key easing overrides the animation default; the next key's callback applies only to the segment it starts."
// Compat package.
import { Animation } from "#compat/animations/animation.ts";

test("a key's easing beats the default, and only in the segment that key starts", () => {
    const anim = new Animation("a", "v", 10);
    anim.setEasingFunction({ ease: () => 0.5 });
    anim.setKeys([
        { frame: 0, value: 0 },
        { frame: 10, value: 10, easingFunction: { ease: () => 0.9 } },
        { frame: 20, value: 20 },
    ]);
    expect(anim.evaluate(2)).toBe(5);
    expect(anim.evaluate(12)).toBe(19);
});
