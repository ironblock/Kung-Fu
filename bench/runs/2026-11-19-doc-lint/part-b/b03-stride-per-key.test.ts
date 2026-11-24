// b-03. Line 290: "LINEAR/STEP: `[value0, value1, ...]` — `stride` floats per keyframe"
// Probed on the samplers a public property clip exposes (clip.tracks[i].sampler).
import { createPropertyAnimationClip } from "@babylonjs/lite";

test("LINEAR and STEP samplers hold stride floats per key, key after key", () => {
    const clip = createPropertyAnimationClip("c", [
        { path: "v3", keys: [{ time: 0, value: [1, 2, 3] }, { time: 1, value: [4, 5, 6] }, { time: 2, value: [7, 8, 9] }] },
        { path: "s", interpolation: "step", keys: [{ time: 0, value: 1 }, { time: 1, value: 2 }, { time: 2, value: 3 }] },
        { path: "rotationQuaternion", keys: [{ time: 0, value: [0, 0, 0, 1] }, { time: 1, value: [0, 1, 0, 0] }] },
    ]);
    const [v3, s, q] = clip.tracks;
    expect(v3!.stride).toBe(3);
    expect(Array.from(v3!.sampler.output)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(s!.stride).toBe(1);
    expect(Array.from(s!.sampler.output)).toEqual([1, 2, 3]);
    expect(q!.stride).toBe(4);
    expect(Array.from(q!.sampler.output)).toEqual([0, 0, 0, 1, 0, 1, 0, 0]);
});
