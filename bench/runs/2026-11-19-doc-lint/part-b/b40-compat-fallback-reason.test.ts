// b-40. Lines 394-395: "Direct or attached tracks with an outgoing non-STEP key callback use the existing compat evaluator, with an explicit fallback reason."
// Compat package. Probed on the direct case only (Animatable._create, the internal entry the compat
// scene's direct animation calls): no Lite group is made, a reason is recorded, and the compat
// evaluator writes the key-eased value.
import { createAnimationManager } from "@babylonjs/lite";
import { Animatable, Animation } from "#compat/animations/animation.ts";

test("an outgoing per-key easing callback keeps the track on the compat evaluator with a reason", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const anim = new Animation("a", "v", 10);
    anim.setKeys([
        { frame: 0, value: 0, easingFunction: { ease: (g: number) => g * g } },
        { frame: 10, value: 10 },
    ]);
    const animatable = Animatable._create(() => manager, target, [anim], 0, 10, true, 1);
    expect(animatable._lite).toBeUndefined();
    expect(animatable._nativeFallbackReason).toMatch(/per-key easing/);
    animatable._tick(500);
    expect(target.v).toBe(2.5);
});
