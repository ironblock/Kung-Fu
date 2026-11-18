import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const clip = () =>
    createPropertyAnimationClip("c", [{ path: "v", frameRate: 10, keys: [{ frame: 0, value: 0 }, { frame: 20, value: 20 }] }]);

test("fromFrame/toFrame are divided by the clip frameRate; fromTime/toTime win over them", () => {
    const manager = createAnimationManager();
    const g1 = createPropertyAnimationGroup(manager, { v: 0 }, clip(), { fromFrame: 5, toFrame: 15 });
    expect(g1.currentTime).toBe(0.5);
    const g2 = createPropertyAnimationGroup(manager, { v: 0 }, clip(), { fromFrame: 5, fromTime: 1 });
    expect(g2.currentTime).toBe(1);
});

test("createPropertyAnimationGroup throws unless toTime > fromTime", () => {
    const manager = createAnimationManager();
    expect(() => createPropertyAnimationGroup(manager, { v: 0 }, clip(), { fromTime: 1, toTime: 1 })).toThrow(
        "Animation play range must have toTime greater than fromTime"
    );
    expect(() => createPropertyAnimationGroup(manager, { v: 0 }, clip(), { fromFrame: 30 })).toThrow();
});

test("toTime past the last key is allowed; past the last key the value holds the last key", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, clip(), { toTime: 5, loop: false });
    updateAnimationManager(manager, 3000);
    expect(group.currentTime).toBe(3);
    expect(target.v).toBe(20);
    expect(group.isPlaying).toBe(true);
    updateAnimationManager(manager, 3000);
    expect(group.currentTime).toBe(5);
    expect(group.isPlaying).toBe(false);
});
