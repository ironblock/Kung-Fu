import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

test("targetedAnimations has one { target, path } per track: the owner of the last part, and the last part", () => {
    const manager = createAnimationManager();
    const target = { position: { x: 0 }, alpha: 1 };
    const clip = createPropertyAnimationClip("c", [
        { path: "position.x", keys: [{ time: 0, value: 1 }, { time: 1, value: 1 }] },
        { path: "alpha", keys: [{ time: 0, value: 1 }, { time: 2, value: 1 }] },
    ]);
    const group = createPropertyAnimationGroup(manager, target, clip, { fromTime: 0.5, toTime: 1 });
    expect(group.targetedAnimations).toEqual([
        { target: target.position, path: "x" },
        { target, path: "alpha" },
    ]);
    expect(group.targetedAnimations[0]!.target).toBe(target.position);
});

test("group.name is the clip name, group.duration is the clip's duration and not the play range", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("walk", [{ path: "v", frameRate: 30, keys: [{ time: 0, value: 1 }, { time: 2, value: 1 }] }]);
    const group = createPropertyAnimationGroup(manager, { v: 0 }, clip, { fromTime: 0.5, toTime: 1 });
    expect(group.name).toBe("walk");
    expect(group.duration).toBe(2);
    expect(group.frameRate).toBe(30);
});
