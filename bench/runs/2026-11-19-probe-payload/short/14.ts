import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("play ranges by time and by frame on a 2 s clip, and a clip whose keys all sit at 0", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", frameRate: 10, keys: [{ frame: 0, value: 0 }, { frame: 20, value: 20 }] }]);
    const g = createPropertyAnimationGroup(manager, { v: 0 }, clip, { fromTime: 0.2, toTime: 0.4, fromFrame: 15, toFrame: 18, loop: false });
    expect(g.currentTime).toBe(0.2);
    updateAnimationManager(manager, 5000);
    expect(g.currentTime).toBe(0.4);
    expect(() => createPropertyAnimationGroup(manager, { v: 0 }, clip, { fromTime: 1, toTime: 1 })).toThrow(/toTime greater than fromTime/);
    const still = createPropertyAnimationClip("still", [{ path: "v", keys: [{ time: 0, value: 7 }] }]);
    expect(still.duration).toBe(0);
    expect(() => createPropertyAnimationGroup(manager, { v: 0 }, still)).toThrow(/toTime greater than fromTime/);
    const target = { v: 0 };
    createPropertyAnimationGroup(manager, target, still, { toTime: 1 });
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(7);
});
