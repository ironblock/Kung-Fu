// b-55. Line 418: "Babylon-style frame ranges are converted once with the clip `frameRate`"
// fromFrame 5 and toFrame 15 on a 10 fps clip become 0.5 s and 1.5 s, at creation. "Once" is read as:
// a later change to the group's frameRate does not move the range.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("fromFrame/toFrame are divided by the clip frameRate when the group is made", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 2, value: 20 }] }], { frameRate: 10 });
    const group = createPropertyAnimationGroup(manager, target, clip, { fromFrame: 5, toFrame: 15 });
    expect(group.currentTime).toBe(0.5);
    (group as { frameRate: number }).frameRate = 100;
    updateAnimationManager(manager, 1250);
    expect(group.currentTime).toBeCloseTo(0.75, 12);
    expect(target.v).toBeCloseTo(7.5, 5);
});
