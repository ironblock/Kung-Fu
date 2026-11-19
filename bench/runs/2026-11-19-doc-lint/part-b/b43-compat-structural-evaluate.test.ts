// b-43. Lines 397-398: "Structural groups use the same `evaluate()` path."
// Compat package. A structural compat AnimationGroup (built with addTargetedAnimation, no loaded Lite
// group) blends the value Animation.evaluate() gives, per-key easing included.
import { Animation, AnimationGroup } from "#compat/animations/animation.ts";

test("a structural group writes Animation.evaluate() at its current frame", () => {
    const target = { v: 0 };
    const anim = new Animation("a", "v", 10);
    anim.setKeys([
        { frame: 0, value: 0, easingFunction: { ease: (g: number) => g * g } },
        { frame: 10, value: 10 },
    ]);
    const group = new AnimationGroup("g");
    group.addTargetedAnimation(anim, target);
    group.start(true, 1, 0, 10);
    group.goToFrame(5);
    AnimationGroup._blendStructuralGroups([group]);
    expect(target.v).toBe(anim.evaluate(5));
    expect(target.v).toBe(2.5);
});
