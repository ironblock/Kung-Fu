// b-05. Lines 292-293: "**Property animation timestamps** use the existing `AnimationSampler.input` `Float32Array`."
import { createPropertyAnimationClip } from "@babylonjs/lite";

test("a property track's key times, in seconds, are the sampler's input Float32Array", () => {
    const clip = createPropertyAnimationClip("c", [
        { path: "a", keys: [{ time: 0, value: 0 }, { time: 0.25, value: 1 }] },
        { path: "b", frameRate: 60, keys: [{ frame: 0, value: 0 }, { frame: 30, value: 1 }] },
    ]);
    expect(clip.tracks[0]!.sampler.input).toBeInstanceOf(Float32Array);
    expect(Array.from(clip.tracks[0]!.sampler.input)).toEqual([0, 0.25]);
    expect(Array.from(clip.tracks[1]!.sampler.input)).toEqual([0, 0.5]);
});
