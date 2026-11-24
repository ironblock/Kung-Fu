import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a track holding 0.1 from time 0 to time 0.3, one update", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0.1 }, { time: 0.3, value: 0.1 }] }]);
    expect(clip.duration).toBe(0.30000001192092896);
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 10);
    expect(target.v).toBe(0.10000000149011612);
    expect(target.v === 0.1).toBe(false);
});
