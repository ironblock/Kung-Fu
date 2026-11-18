import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a key needs exactly one of time and frame", () => {
    expect(() => createPropertyAnimationClip("c", [{ path: "v", keys: [{ value: 1 }] }])).toThrow('Animation key for "v" must provide exactly one of time or frame');
    expect(() => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, frame: 0, value: 1 }] }])).toThrow();
});

test("frame rate: options.frameRate, else the first track's frameRate, else 60; a track's own frameRate converts its own frames", () => {
    expect(createPropertyAnimationClip("c", [{ path: "v", keys: [{ frame: 30, value: 1 }] }]).frameRate).toBe(60);
    expect(createPropertyAnimationClip("c", [{ path: "v", keys: [{ frame: 30, value: 1 }] }]).duration).toBe(0.5);
    const c = createPropertyAnimationClip(
        "c",
        [
            { path: "a", frameRate: 10, keys: [{ frame: 10, value: 1 }] },
            { path: "b", keys: [{ frame: 10, value: 1 }] },
            { path: "d", frameRate: 5, keys: [{ frame: 10, value: 1 }] },
        ],
        {}
    );
    expect(c.frameRate).toBe(10);
    expect(Array.from(c.tracks[1]!.sampler.input)).toEqual([1]);
    expect(Array.from(c.tracks[2]!.sampler.input)).toEqual([2]);
    expect(c.duration).toBe(2);
    const d = createPropertyAnimationClip("c", [{ path: "a", frameRate: 10, keys: [{ frame: 10, value: 1 }] }], { frameRate: 20 });
    expect(d.frameRate).toBe(20);
    expect(d.duration).toBe(1);
});

test("keys are sorted by time; a negative time throws; no tracks or no keys throws", () => {
    const c = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 2, value: 20 }, { time: 0, value: 0 }, { time: 1, value: 5 }] }]);
    expect(Array.from(c.tracks[0]!.sampler.input)).toEqual([0, 1, 2]);
    expect(Array.from(c.tracks[0]!.sampler.output)).toEqual([0, 5, 20]);
    expect(() => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: -1, value: 0 }] }])).toThrow("must have a non-negative time");
    expect(() => createPropertyAnimationClip("c", [])).toThrow("createPropertyAnimationClip requires at least one track");
    expect(() => createPropertyAnimationClip("c", [{ path: "v", keys: [] }])).toThrow('Animation track "v" requires at least one key');
});

test("clip.duration is the latest key time over all tracks", () => {
    const c = createPropertyAnimationClip("c", [
        { path: "a", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] },
        { path: "b", keys: [{ time: 0.5, value: 0 }, { time: 3, value: 1 }] },
    ]);
    expect(c.duration).toBe(3);
});

test("a track shorter than the clip holds its last value until the clip ends", () => {
    const manager = createAnimationManager();
    const target = { a: 0, b: 0 };
    createPropertyAnimationGroup(
        manager,
        target,
        createPropertyAnimationClip("c", [
            { path: "a", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] },
            { path: "b", keys: [{ time: 0, value: 0 }, { time: 3, value: 3 }] },
        ]),
        { loop: false }
    );
    updateAnimationManager(manager, 2000);
    expect(target).toEqual({ a: 1, b: 2 });
});
