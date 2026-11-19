// c-56. Line 628 (map row): `animation.setEasingFunction(easing)` corresponds to track option
// `easing: (gradient) => easing.ease(gradient)`.
// Checked: a Babylon.js-shaped easing object ({ ease(g) }) wrapped as the row shows is accepted as the track's easing,
// and the value at the middle of a 0-to-10 segment is 10 * ease(0.5).
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("easing option takes a gradient function", () => {
    const easing = { ease: (g: number) => g * g * g };
    const clip = createPropertyAnimationClip("c", [{ path: "v", easing: (gradient) => easing.ease(gradient), keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const manager = createAnimationManager();
    const target = { v: -1 };
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 500);
    expect(target.v).toBeCloseTo(1.25, 5);
});
