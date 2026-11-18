import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

function at(clip: ReturnType<typeof createPropertyAnimationClip>, seconds: number, target: Record<string, number>): number {
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip, { toTime: 10 });
    // goToFrame at the group's frame rate, here 1 frame per second
    goToFrame(group, seconds * group.frameRate!);
    return target.v!;
}

test("before the first key the value is the first key's; after the last key it is the last key's", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", frameRate: 1, keys: [{ time: 1, value: 10 }, { time: 2, value: 20 }] }]);
    expect(at(clip, 0, { v: 0 })).toBe(10);
    expect(at(clip, 0.5, { v: 0 })).toBe(10);
    expect(at(clip, 1.5, { v: 0 })).toBe(15);
    expect(at(clip, 2, { v: 0 })).toBe(20);
});

test("step holds each key's value until the next key's time, and takes the new key at exactly its time", () => {
    const clip = createPropertyAnimationClip("c", [
        { path: "v", frameRate: 1, interpolation: "step", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 2, value: 20 }] },
    ]);
    expect(at(clip, 0.99, { v: -1 })).toBe(0);
    expect(at(clip, 1, { v: -1 })).toBe(10);
    expect(at(clip, 1.5, { v: -1 })).toBe(10);
    expect(at(clip, 2, { v: -1 })).toBe(20);
});

test("linear is the default; vectors interpolate per component", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "p", frameRate: 1, keys: [{ time: 0, value: [0, 10] }, { time: 2, value: [2, 30] }] }]);
    const target = { p: { x: 0, y: 0 } };
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    goToFrame(group, 0.5);
    expect(target.p).toEqual({ x: 0.5, y: 15 });
});
