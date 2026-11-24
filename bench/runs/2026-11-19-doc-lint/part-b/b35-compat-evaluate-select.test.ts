// b-35. Lines 386-388: "For each non-STEP segment `[a, b)`, `Animation.evaluate()` selects `a.easingFunction ?? animation.getEasingFunction()` and applies its `ease()` method to normalized progress before interpolation."
// Compat package.
import { Animation } from "#compat/animations/animation.ts";

test("a segment uses its start key's easing, else the animation's, on normalized progress", () => {
    const seenKey: number[] = [];
    const seenDefault: number[] = [];
    const keyEase = { ease: (g: number) => (seenKey.push(g), g * g) };
    const defEase = { ease: (g: number) => (seenDefault.push(g), Math.sqrt(g)) };
    const anim = new Animation("a", "v", 10);
    anim.setEasingFunction(defEase);
    anim.setKeys([
        { frame: 0, value: 0, easingFunction: keyEase },
        { frame: 10, value: 10 },
        { frame: 30, value: 30 },
    ]);
    expect(anim.evaluate(5)).toBe(2.5);
    expect(seenKey).toEqual([0.5]);
    expect(seenDefault).toEqual([]);
    expect(anim.evaluate(15)).toBe(20);
    expect(seenDefault).toEqual([0.25]);
});
