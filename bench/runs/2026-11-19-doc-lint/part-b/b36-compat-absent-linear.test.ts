// b-36. Lines 388-389: "An absent callback leaves progress linear."
// Compat package.
import { Animation } from "#compat/animations/animation.ts";

test("no key easing and no animation easing: linear", () => {
    const anim = new Animation("a", "v", 10);
    anim.setKeys([
        { frame: 0, value: 0 },
        { frame: 10, value: 10 },
    ]);
    expect(anim.getEasingFunction()).toBeNull();
    expect(anim.evaluate(3)).toBe(3);
    expect(anim.evaluate(7.5)).toBe(7.5);
});
