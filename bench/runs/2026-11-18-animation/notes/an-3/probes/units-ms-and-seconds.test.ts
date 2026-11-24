import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, updateAnimationManager } from "@babylonjs/lite";

it("deltaMs is milliseconds; currentTime, duration, key time, fromTime and toTime are seconds; a frame is seconds x frameRate", () => {
    const manager = createAnimationManager();
    const target = { value: 0 };
    const clip = createPropertyAnimationClip("c", [
        {
            path: "value",
            frameRate: 30,
            keys: [
                { frame: 0, value: 0 },
                { frame: 60, value: 20 },
            ],
        },
    ]);
    expect(clip.duration).toBe(2);
    const group = createPropertyAnimationGroup(manager, target, clip);
    expect(group.duration).toBe(2);
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBeCloseTo(0.5);
    expect(target.value).toBeCloseTo(5);
    goToFrame(group, 45);
    expect(group.currentTime).toBeCloseTo(1.5);

    const timed = createPropertyAnimationClip("t", [{ path: "value", keys: [{ time: 0, value: 0 }, { time: 2, value: 20 }] }]);
    expect(timed.duration).toBe(2);
    const m2 = createAnimationManager();
    const t2 = { value: 0 };
    const ranged = createPropertyAnimationGroup(m2, t2, timed, { fromTime: 0.5, toTime: 1.5, loop: false });
    expect(ranged.currentTime).toBe(0.5);
    updateAnimationManager(m2, 2000);
    expect(ranged.currentTime).toBe(1.5);
    expect(t2.value).toBe(15);
});
