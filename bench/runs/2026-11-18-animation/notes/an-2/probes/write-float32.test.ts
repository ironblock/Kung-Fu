import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("written values are float32: a key of 0.1 writes Math.fround(0.1)", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0.1 }, { time: 1, value: 0.1 }] }]));
    updateAnimationManager(manager, 0);
    expect(target.v).not.toBe(0.1);
    expect(target.v).toBe(Math.fround(0.1));
    expect(target.v).toBe(0.10000000149011612);
});

test("currentTime is not rounded to float32", () => {
    const manager = createAnimationManager();
    const group = createPropertyAnimationGroup(manager, { v: 0 }, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]));
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBe(0.1);
});
