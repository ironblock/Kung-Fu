import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, getAnimationGroups, updateAnimationManager } from "@babylonjs/lite";

const clip = () =>
    createPropertyAnimationClip("c", [
        { path: "v", keys: [{ time: 0, value: 10 }, { time: 1, value: 20 }] },
    ]);

test("the group plays at once, loops by default, is attached, and writes nothing before an update", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip());
    expect(group.isPlaying).toBe(true);
    expect(group.loopAnimation).toBe(true);
    expect(group.speedRatio).toBe(1);
    expect(group.weight).toBe(1);
    expect(getAnimationGroups(manager)).toEqual([group]);
    expect(target.v).toBe(-1);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(10);
});

test("an update first advances time, then writes: the first value written after a 16 ms update is the value at 0.016 s", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip());
    updateAnimationManager(manager, 16);
    expect(group.currentTime).toBeCloseTo(0.016, 10);
    expect(target.v).toBeCloseTo(10.16, 4);
});

test("deltaMs is in milliseconds and currentTime is in seconds", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip(), { loop: false });
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(15);
});
