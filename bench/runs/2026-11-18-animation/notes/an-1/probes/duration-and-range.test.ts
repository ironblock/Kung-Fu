// Note: clip duration is the latest key time over all tracks; the default range is 0..duration; before a track's first key it holds the first value, after its last key the last value.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

it("holds first and last values", () => {
    const clip = createPropertyAnimationClip("c", [
        { path: "late", keys: [{ time: 1, value: 10 }, { time: 2, value: 20 }] },
        { path: "short", keys: [{ time: 0, value: 0 }, { time: 0.5, value: 5 }] },
    ]);
    expect(clip.duration).toBe(2);
    const manager = createAnimationManager();
    const target = { late: -1, short: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip, { loop: false });
    expect(group.currentTime).toBe(0);
    updateAnimationManager(manager, 500);
    expect(target.late).toBe(10);
    expect(target.short).toBe(5);
    updateAnimationManager(manager, 1000);
    expect(target.late).toBe(15);
    expect(target.short).toBe(5);
});

it("unsorted keys are sorted by time", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 1, value: 10 }, { time: 0, value: 0 }] }]);
    expect(Array.from(clip.tracks[0]!.sampler.input)).toEqual([0, 1]);
});
