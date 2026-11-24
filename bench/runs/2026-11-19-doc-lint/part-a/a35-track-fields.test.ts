// a-35, lines 117-123: "export interface PropertyAnimationTrack {" with fields path, sampler, stride, quaternion, easing?
// A compiled track carries these fields with these values.
import { createPropertyAnimationClip } from "@babylonjs/lite";

test("a compiled track has path, sampler, stride, quaternion and easing", () => {
    const easing = (p: number) => p;
    const clip = createPropertyAnimationClip("c", [{ path: "pos", easing, keys: [{ time: 0, value: [0, 0, 0] }, { time: 1, value: [1, 2, 3] }] }]);
    const t = clip.tracks[0]!;
    expect(t.path).toBe("pos");
    expect(Array.from(t.sampler.input)).toEqual([0, 1]);
    expect(Array.from(t.sampler.output)).toEqual([0, 0, 0, 1, 2, 3]);
    expect(t.sampler.interpolation).toBe(0);
    expect(t.stride).toBe(3);
    expect(t.quaternion).toBe(false);
    expect(t.easing).toBe(easing);
});
