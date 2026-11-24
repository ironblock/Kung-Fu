// a-29, line 92: "/** Frame index converted with `frameRate`. Mutually exclusive with `time`. */"
// Frame 30 at a track frameRate of 30 is 1 s; at the clip default (60, no frameRate given) it is 0.5 s.
// The "mutually exclusive" half is the same rule as a-28 and is probed there.
import { createPropertyAnimationClip } from "@babylonjs/lite";

test("frame keys are converted to seconds with frameRate", () => {
    const at30 = createPropertyAnimationClip("c", [{ path: "v", frameRate: 30, keys: [{ frame: 0, value: 0 }, { frame: 30, value: 1 }] }]);
    expect(at30.duration).toBe(1);
    const atDefault = createPropertyAnimationClip("c", [{ path: "v", keys: [{ frame: 0, value: 0 }, { frame: 30, value: 1 }] }]);
    expect(atDefault.duration).toBe(0.5);
});
