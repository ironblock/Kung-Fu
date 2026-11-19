// b-41. Lines 395-396: "Independent supported tracks still delegate to Lite."
// Compat package. Two animations on unrelated properties of one target: "a" has a per-key callback,
// "b" has none. "b" runs on a Lite group (driven by the Lite manager); "a" is the only fallback.
import { createAnimationManager, getAnimationGroups, updateAnimationManager } from "@babylonjs/lite";
import { Animatable, Animation } from "#compat/animations/animation.ts";

test("a track that does not overlap the fallback one still runs on Lite", () => {
    const manager = createAnimationManager();
    const target = { a: -1, b: -1 };
    const a = new Animation("a", "a", 10);
    a.setKeys([
        { frame: 0, value: 0, easingFunction: { ease: (g: number) => g * g } },
        { frame: 10, value: 10 },
    ]);
    const b = new Animation("b", "b", 10);
    b.setKeys([
        { frame: 0, value: 0 },
        { frame: 10, value: 10 },
    ]);
    const animatable = Animatable._create(() => manager, target, [a, b], 0, 10, true, 1);
    expect(animatable._lite).toBeDefined();
    expect(getAnimationGroups(manager)).toContain(animatable._lite);
    expect(animatable._nativeFallbackReason).toMatch(/"a"/);
    expect(animatable._nativeFallbackReason).not.toMatch(/"b"/);
    updateAnimationManager(manager, 500);
    expect(target.b).toBe(5);
});
