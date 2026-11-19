// b-01. Line 286: "All animation data uses flat typed arrays for GPU-friendly memory layout:"
// Reading (the one most favourable to the sentence): the keyframe data a user can reach on a
// compiled property clip is held in flat Float32Arrays, values one after another, not in arrays of objects.
import { createPropertyAnimationClip } from "@babylonjs/lite";

test("a compiled property clip keeps its key times and values in flat Float32Arrays", () => {
    const clip = createPropertyAnimationClip("c", [
        { path: "p", keys: [{ time: 0, value: [1, 2, 3] }, { time: 1, value: [4, 5, 6] }] },
    ]);
    const sampler = clip.tracks[0]!.sampler;
    expect(sampler.input).toBeInstanceOf(Float32Array);
    expect(sampler.output).toBeInstanceOf(Float32Array);
    expect(Array.from(sampler.output)).toEqual([1, 2, 3, 4, 5, 6]);
});
