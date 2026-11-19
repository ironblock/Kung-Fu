// c-18. Line 571: "Bindings are target-specific; `PropertyAnimationClip` is reusable, while the generated property
// runtime tracks are owned by the returned `AnimationGroup`."
// Checked: one clip makes two groups on two targets; each group writes only its own target, and pausing one leaves
// the other playing.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, pauseAnimation, updateAnimationManager } from "@babylonjs/lite";

test("one clip, two independent target-bound groups", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const manager = createAnimationManager();
    const a = { v: -1 };
    const b = { v: -1 };
    const ga = createPropertyAnimationGroup(manager, a, clip);
    const gb = createPropertyAnimationGroup(manager, b, clip);
    expect(ga).not.toBe(gb);
    updateAnimationManager(manager, 200);
    pauseAnimation(ga);
    updateAnimationManager(manager, 200);
    expect(a.v).toBe(2);
    expect(b.v).toBe(4);
});
