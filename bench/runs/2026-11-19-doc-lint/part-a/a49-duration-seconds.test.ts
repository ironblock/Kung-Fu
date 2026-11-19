// a-49, line 185: "readonly duration: number; // seconds"
// A property clip whose last key is at frame 120 at 60 fps is 2 s long; the group's duration is 2.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

test("group.duration is in seconds", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ frame: 0, value: 0 }, { frame: 120, value: 1 }] }]);
    const g = createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, clip);
    expect(g.duration).toBe(2);
});
