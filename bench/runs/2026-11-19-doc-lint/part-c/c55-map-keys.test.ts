// c-55. Line 627 (map row): `animation.setKeys(keys)` corresponds to "keys passed to `createPropertyAnimationClip()`".
// Checked: frame-numbered keys passed in the track (given out of order, as setKeys accepts) are placed at
// frame / frameRate and sorted.
import { createPropertyAnimationClip } from "@babylonjs/lite";

test("keys go in the track", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", frameRate: 20, keys: [{ frame: 40, value: 2 }, { frame: 0, value: 0 }, { frame: 10, value: 1 }] }]);
    expect(Array.from(clip.tracks[0]!.sampler.input)).toEqual([0, 0.5, 2]);
    expect(Array.from(clip.tracks[0]!.sampler.output)).toEqual([0, 1, 2]);
});
