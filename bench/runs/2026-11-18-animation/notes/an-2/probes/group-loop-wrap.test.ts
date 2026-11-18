import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const clip = () => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 2, value: 20 }] }]);

test("a looping group wraps by modulo; landing exactly on the range end gives the start value", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip());
    updateAnimationManager(manager, 2000);
    expect(group.currentTime).toBe(0);
    expect(target.v).toBe(0);
    updateAnimationManager(manager, 4500);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(5);
});

test("a looping group with a play range wraps inside [fromTime, toTime)", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip(), { fromTime: 0.5, toTime: 1.5 });
    expect(group.currentTime).toBe(0.5);
    updateAnimationManager(manager, 1250);
    expect(group.currentTime).toBeCloseTo(0.75, 10);
    expect(target.v).toBeCloseTo(7.5, 5);
});

test("a negative speedRatio runs a looping group backward and wraps", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip(), { speedRatio: -1 });
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBe(1.5);
    expect(target.v).toBe(15);
});

test("a negative speedRatio on a non-looping group stops at fromTime but leaves isPlaying true", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip(), { speedRatio: -1, loop: false, fromTime: 1 });
    updateAnimationManager(manager, 3000);
    expect(group.currentTime).toBe(1);
    expect(target.v).toBe(10);
    expect(group.isPlaying).toBe(true);
});
