// b-33. Line 374: "Native property tracks retain their track-wide easing contract."
// Reading: one easing callback per native track, applied to every non-STEP segment of it.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

test("a track's one easing applies in each of its segments", () => {
    const target = { v: -1 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", easing: (g) => g * g, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 2, value: 30 }] }], { frameRate: 2 });
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    goToFrame(group, 1);
    expect(target.v).toBe(2.5);
    goToFrame(group, 3);
    expect(target.v).toBe(15);
});
