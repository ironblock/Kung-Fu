// Note: time is seconds; frame is divided by the track frameRate, else the clip's; clip frameRate is options.frameRate, else tracks[0].frameRate, else 60; exactly one of time/frame.
import { expect, it } from "vitest";
import { createPropertyAnimationClip } from "@babylonjs/lite";

it("frame rates", () => {
    const fromTrack0 = createPropertyAnimationClip("a", [
        { path: "v", frameRate: 30, keys: [{ frame: 0, value: 0 }, { frame: 30, value: 1 }] },
        { path: "w", keys: [{ frame: 0, value: 0 }, { frame: 60, value: 1 }] },
    ]);
    expect(fromTrack0.frameRate).toBe(30);
    expect(Array.from(fromTrack0.tracks[0]!.sampler.input)).toEqual([0, 1]);
    expect(Array.from(fromTrack0.tracks[1]!.sampler.input)).toEqual([0, 2]);

    const fromOptions = createPropertyAnimationClip("b", [{ path: "v", frameRate: 30, keys: [{ frame: 0, value: 0 }, { frame: 30, value: 1 }] }, { path: "w", keys: [{ frame: 10, value: 0 }] }], { frameRate: 10 });
    expect(fromOptions.frameRate).toBe(10);
    expect(Array.from(fromOptions.tracks[0]!.sampler.input)).toEqual([0, 1]);
    expect(Array.from(fromOptions.tracks[1]!.sampler.input)).toEqual([1]);

    const seconds = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 2.5, value: 1 }] }]);
    expect(seconds.frameRate).toBe(60);
    expect(seconds.duration).toBe(2.5);

    expect(() => createPropertyAnimationClip("d", [{ path: "v", keys: [{ time: 0, frame: 0, value: 0 }] }])).toThrow(/exactly one of time or frame/);
    expect(() => createPropertyAnimationClip("e", [{ path: "v", keys: [{ value: 0 }] }])).toThrow(/exactly one of time or frame/);
});
