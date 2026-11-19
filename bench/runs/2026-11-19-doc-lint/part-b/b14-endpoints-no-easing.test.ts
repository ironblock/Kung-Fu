// b-14. Lines 315-317: "Samples at or beyond the first and final key return those key values directly without invoking easing, so custom callbacks cannot move clip endpoints."
// Keys 0.5 s -> 2 and 1.5 s -> 6; the easing callback always returns 5. Times before and at the
// first key, and at or past the last, give the key values and no call. An interior time does call it.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, updateAnimationManager } from "@babylonjs/lite";

test("first and last keys are returned as they are, with no easing call", () => {
    let calls = 0;
    const easing = () => {
        calls++;
        return 5;
    };
    const target = { v: -1 };
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", easing, keys: [{ time: 0.5, value: 2 }, { time: 1.5, value: 6 }] }], { frameRate: 4 });
    const group = createPropertyAnimationGroup(manager, target, clip, { loop: false });
    goToFrame(group, 1); // 0.25 s, before the first key
    expect(target.v).toBe(2);
    goToFrame(group, 2); // 0.5 s, at the first key
    expect(target.v).toBe(2);
    goToFrame(group, 6); // 1.5 s, at the last key
    expect(target.v).toBe(6);
    expect(calls).toBe(0);
    goToFrame(group, 4); // 1 s, interior
    expect(calls).toBe(1);
    expect(target.v).toBe(22);
    calls = 0;
    group.isPlaying = true;
    updateAnimationManager(manager, 5000); // plays to the end of a non-looping group
    expect(target.v).toBe(6);
    expect(calls).toBe(0);
});
