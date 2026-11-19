// c-109. Line 739: "**goToFrame**: Verify `goToFrame(120)` sets time to `2.0` seconds, evaluates the pose immediately,
// and pauses"
// Checked on a property group at the default frame rate (60, so frame 120 is 2 s), keys 0..3 s: time 2, value at 2 s
// written at once, paused.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

test("goToFrame(120)", () => {
    const target = { v: -1 };
    const g = createPropertyAnimationGroup(createAnimationManager(), target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 3, value: 30 }] }]));
    goToFrame(g, 120);
    expect(g.currentTime).toBe(2);
    expect(target.v).toBeCloseTo(20, 5);
    expect(g.isPlaying).toBe(false);
});
