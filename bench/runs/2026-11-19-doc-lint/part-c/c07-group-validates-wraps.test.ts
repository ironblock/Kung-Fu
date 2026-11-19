// c-07. Line 555: "`createPropertyAnimationGroup()` validates each track against the target, builds compact property
// runtime tracks (`sampler`, `stride`, `quaternion`, `easing`, `writer`, `mixTarget`, `mixProperty`), and wraps them
// in an `AnimationGroup`."
// Checked, the user-visible part: each track is checked against the target (a clip whose second track names a missing
// property is refused), and the result is an animation group that plays every track. The runtime track field names
// are internal and are not checked.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("validates every track, returns a group over all tracks", () => {
    const keys = [{ time: 0, value: 0 }, { time: 1, value: 10 }];
    const bad = createPropertyAnimationClip("c", [{ path: "a", keys }, { path: "missing", keys }]);
    expect(() => createPropertyAnimationGroup(createAnimationManager(), { a: 0 }, bad)).toThrow();
    const good = createPropertyAnimationClip("c", [{ path: "a", keys }, { path: "b", keys }]);
    const manager = createAnimationManager();
    const target = { a: -1, b: -1 };
    const group = createPropertyAnimationGroup(manager, target, good);
    expect(group.name).toBe("c");
    expect(group.isPlaying).toBe(true);
    updateAnimationManager(manager, 500);
    expect(target).toEqual({ a: 5, b: 5 });
});
