// b-06. Lines 293-295: "Property-only evaluation canonicalizes playback time with `Math.fround()` before key lookup and interpolation so caller-authored frame and time boundaries are compared in the same precision domain."
// Case: a key at frame 6 of 60 fps sits at 0.1 s. The Float32 key time is Math.fround(0.1), a little
// above the double 0.1. Seeking to frame 6 gives the double 0.1. With the canonicalization, the
// STEP track shows key 1's value and the LINEAR track lands exactly on key 1's value.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

test("a seek to a key's frame selects that key, on STEP and LINEAR tracks", () => {
    expect(Math.fround(0.1)).not.toBe(0.1);
    const keys = [{ frame: 0, value: 0 }, { frame: 6, value: 1 }, { frame: 12, value: 2 }];
    const target = { s: -1, l: -1 };
    const clip = createPropertyAnimationClip("c", [
        { path: "s", interpolation: "step", keys },
        { path: "l", keys },
    ], { frameRate: 60 });
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    goToFrame(group, 6);
    expect(group.currentTime).toBe(0.1);
    expect(target.s).toBe(1);
    expect(target.l).toBe(1);
});
