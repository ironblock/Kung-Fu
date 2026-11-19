import { expect, test } from "vitest";
import { createPropertyAnimationClip } from "@babylonjs/lite";

test("keys given by frame and by time, with frame rates on a track, on the options, or nowhere", () => {
    const tracks = () => [
        { path: "v", frameRate: 30, keys: [{ frame: 30, value: 1 }] },
        { path: "w", keys: [{ frame: 30, value: 1 }] },
    ];
    const a = createPropertyAnimationClip("a", tracks());
    expect(a.frameRate).toBe(30);
    expect(a.tracks.map((t) => t.sampler.input[0])).toEqual([1, 1]);
    const b = createPropertyAnimationClip("b", tracks(), { frameRate: 10 });
    expect(b.frameRate).toBe(10);
    expect(b.tracks.map((t) => t.sampler.input[0])).toEqual([1, 3]);
    const c = createPropertyAnimationClip("c", [{ path: "v", keys: [{ frame: 30, value: 1 }, { time: 2, value: 2 }] }]);
    expect(c.frameRate).toBe(60);
    expect(Array.from(c.tracks[0]!.sampler.input)).toEqual([0.5, 2]);
    expect(() => createPropertyAnimationClip("d", [{ path: "v", keys: [{ time: 0, frame: 0, value: 0 }] }])).toThrow("must provide exactly one of time or frame");
    expect(() => createPropertyAnimationClip("e", [{ path: "v", keys: [{ value: 0 }] }])).toThrow("must provide exactly one of time or frame");
});
