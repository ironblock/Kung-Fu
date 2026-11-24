// c-49. Line 619: "Property clips clamp seeks to the compiled key domain, not the active play range;"
// Checked on a clip whose keys run from 0 s to 2 s and a play range of frames 5..10 at 10 fps (0.5 s..1 s): a seek to
// frame 50 lands at 2 s (the last key), a seek to frame 2 stays at 0.2 s (outside the range, inside the keys), and a
// seek to frame -5 lands at 0 s. Fair reading: the keys start at 0, so the clip's domain 0..duration is the key domain.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

test("seeks clamp to the keys, not the range", () => {
    const target = { v: -1 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", frameRate: 10, keys: [{ frame: 0, value: 0 }, { frame: 20, value: 20 }] }]);
    const g = createPropertyAnimationGroup(createAnimationManager(), target, clip, { fromFrame: 5, toFrame: 10 });
    goToFrame(g, 50);
    expect([g.currentTime, target.v]).toEqual([2, 20]);
    goToFrame(g, 2);
    expect(g.currentTime).toBeCloseTo(0.2, 6);
    expect(target.v).toBeCloseTo(2, 5);
    goToFrame(g, -5);
    expect([g.currentTime, target.v]).toEqual([0, 0]);
});
