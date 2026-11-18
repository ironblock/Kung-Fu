import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a clip whose keys are all at time 0 has duration 0, and createPropertyAnimationGroup throws on it", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 3 }] }]);
    expect(clip.duration).toBe(0);
    expect(() => createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, clip)).toThrow("Animation play range must have toTime greater than fromTime");
});

test("the same clip works when toTime above 0 is given", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 3 }] }]);
    const manager = createAnimationManager();
    const target = { v: 0 };
    createPropertyAnimationGroup(manager, target, clip, { toTime: 1 });
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(3);
});

test("a single key at a time above 0 gives a usable clip that holds that value", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 1, value: 3 }] }]);
    expect(clip.duration).toBe(1);
    const manager = createAnimationManager();
    const target = { v: 0 };
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(3);
});
