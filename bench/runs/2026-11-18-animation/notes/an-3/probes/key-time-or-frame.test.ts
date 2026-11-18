import { expect, it } from "vitest";
import { createPropertyAnimationClip } from "@babylonjs/lite";
import { thrown } from "./_lib";

it("each key needs exactly one of time or frame; keys are sorted; duration is the latest key time over all tracks", () => {
    expect(thrown(() => createPropertyAnimationClip("c", [{ path: "a", keys: [{ time: 0, frame: 0, value: 0 }] }]))).toMatch(/exactly one of time or frame/);
    expect(thrown(() => createPropertyAnimationClip("c", [{ path: "a", keys: [{ value: 0 }] }]))).toMatch(/exactly one of time or frame/);
    const clip = createPropertyAnimationClip("c", [
        { path: "a", keys: [{ time: 2, value: 20 }, { time: 1, value: 10 }] },
        { path: "b", keys: [{ time: 0, value: 0 }, { time: 3, value: 1 }] },
    ]);
    expect(Array.from(clip.tracks[0]!.sampler.input)).toEqual([1, 2]);
    expect(clip.duration).toBe(3);
});
