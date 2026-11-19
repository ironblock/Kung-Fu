// a-51, line 186: "readonly frameRate: number; // used by goToFrame()"
// A property clip at 30 fps: goToFrame(group, 15) lands at 0.5 s.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

test("goToFrame converts frames with group.frameRate", () => {
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }], { frameRate: 30 });
    const g = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    expect(g.frameRate).toBe(30);
    goToFrame(g, 15);
    expect(g.currentTime).toBeCloseTo(0.5, 6);
    expect(target.v).toBeCloseTo(5, 5);
});
