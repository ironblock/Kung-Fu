// a-28, line 90: "/** Timestamp in seconds. Mutually exclusive with `frame`. */"
// Two parts: `time` is seconds; a key that gives both `time` and `frame` is refused.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("time is in seconds", () => {
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 2, value: 10 }] }]);
    expect(clip.duration).toBe(2);
    const manager = createAnimationManager();
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 1000);
    expect(target.v).toBeCloseTo(5, 5);
});

test("time and frame together are refused", () => {
    expect(() => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, frame: 0, value: 0 }] }])).toThrow();
});
