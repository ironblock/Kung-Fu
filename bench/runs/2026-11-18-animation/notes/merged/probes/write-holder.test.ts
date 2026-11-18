import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("all paths start at the one target; a holder object lets one group animate several objects", () => {
    const a = { position: { x: 0 } };
    const b = { alpha: 0 };
    const clip = createPropertyAnimationClip("c", [
        { path: "a.position.x", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] },
        { path: "b.alpha", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] },
    ]);
    const manager = createAnimationManager();
    const group = createPropertyAnimationGroup(manager, { a, b }, clip);
    updateAnimationManager(manager, 500);
    expect(a.position.x).toBe(5);
    expect(b.alpha).toBe(0.5);
    expect(group.targetedAnimations).toEqual([
        { target: a.position, path: "x" },
        { target: b, path: "alpha" },
    ]);
});

test("one clip can be bound to several targets, one group each", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const manager = createAnimationManager();
    const t1 = { v: 0 };
    const t2 = { v: 0 };
    const g1 = createPropertyAnimationGroup(manager, t1, clip);
    createPropertyAnimationGroup(manager, t2, clip, { fromTime: 0.5 });
    updateAnimationManager(manager, 100);
    expect(t1.v).toBeCloseTo(1, 5);
    expect(t2.v).toBeCloseTo(6, 5);
    expect(g1.name).toBe("c");
});
