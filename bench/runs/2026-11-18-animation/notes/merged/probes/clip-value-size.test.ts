import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("the first key's value sets the size; a key of another size throws", () => {
    const c = createPropertyAnimationClip("c", [{ path: "p", keys: [{ time: 0, value: [1, 2, 3] }, { time: 1, value: [1, 2, 3] }] }]);
    expect(c.tracks[0]!.stride).toBe(3);
    expect(() => createPropertyAnimationClip("c", [{ path: "p", keys: [{ time: 0, value: [1, 2, 3] }, { time: 1, value: [1, 2] }] }])).toThrow(
        'Animation key for "p" expected 3 values'
    );
    expect(() => createPropertyAnimationClip("c", [{ path: "p", keys: [{ time: 0, value: 1 }, { time: 1, value: [1, 2] }] }])).toThrow('expected 1 values');
    expect(() => createPropertyAnimationClip("c", [{ path: "p", keys: [{ time: 0, value: [1, 2] }, { time: 1, value: 2 }] }])).toThrow('expected 2 values');
});

test("the size is taken from the first key as given, before sorting", () => {
    // keys[0] is the later key; its size 2 is the track size, so the earlier size-3 key throws
    expect(() => createPropertyAnimationClip("c", [{ path: "p", keys: [{ time: 1, value: [1, 2] }, { time: 0, value: [1, 2, 3] }] }])).toThrow('expected 2 values');
});

test("a size above 4 builds a clip, but binding it to a target throws", () => {
    const c = createPropertyAnimationClip("c", [{ path: "m", keys: [{ time: 0, value: [1, 2, 3, 4, 5] }, { time: 1, value: [1, 2, 3, 4, 5] }] }]);
    expect(c.tracks[0]!.stride).toBe(5);
    expect(() => createPropertyAnimationGroup(createAnimationManager(), { m: { x: 0 } }, c)).toThrow('Animation property path "m" has unsupported vector size 5');
});

test("a one-element array and a number are both size 1, and assign a number", () => {
    const manager = createAnimationManager();
    const c = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: [7] }, { time: 1, value: 9 }] }]);
    expect(c.tracks[0]!.stride).toBe(1);
    const target = { v: 0 };
    createPropertyAnimationGroup(manager, target, c);
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(8);
});
