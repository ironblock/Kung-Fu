import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a clip with one key at time 0, with and without toTime; a 2 s clip with fromTime 1 and toTime 1", () => {
    const manager = createAnimationManager();
    const single = createPropertyAnimationClip("s", [{ path: "v", keys: [{ time: 0, value: 5 }] }]);
    expect(single.duration).toBe(0);
    expect(() => createPropertyAnimationGroup(manager, { v: 0 }, single)).toThrow(/toTime greater than fromTime/);
    const target = { v: 0 };
    createPropertyAnimationGroup(manager, target, single, { toTime: 1 });
    updateAnimationManager(manager, 16);
    expect(target.v).toBe(5);
    const ramp = createPropertyAnimationClip("r", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 2, value: 2 }] }]);
    expect(() => createPropertyAnimationGroup(manager, { v: 0 }, ramp, { fromTime: 1, toTime: 1 })).toThrow(/toTime greater than fromTime/);
});
