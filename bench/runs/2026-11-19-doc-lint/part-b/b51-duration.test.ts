// b-51. Line 413: "Duration is in seconds (max sampler input timestamp)"
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

test("clip and group duration are the latest key time, in seconds", () => {
    const clip = createPropertyAnimationClip(
        "c",
        [
            { path: "a", keys: [{ time: 0, value: 0 }, { time: 1.5, value: 1 }] },
            { path: "b", keys: [{ frame: 0, value: 0 }, { frame: 25, value: 1 }] },
            { path: "c", keys: [{ time: 0.5, value: 0 }, { time: 2, value: 1 }] },
        ],
        { frameRate: 10 }
    );
    expect(clip.duration).toBe(2.5);
    const group = createPropertyAnimationGroup(createAnimationManager(), { a: 0, b: 0, c: 0 }, clip);
    expect(group.duration).toBe(2.5);
});
