// c-64. Line 636 (map row): `AnimationGroup.loopAnimation` corresponds to `group.loopAnimation`.
// Checked: on a 1 s property group, loopAnimation true wraps 1.25 s to 0.25 s; set to false, the group holds its end.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const clip = () => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);

test("group.loopAnimation", () => {
    const manager = createAnimationManager();
    const looped = { v: 0 };
    const held = { v: 0 };
    const a = createPropertyAnimationGroup(manager, looped, clip());
    const b = createPropertyAnimationGroup(manager, held, clip());
    expect(a.loopAnimation).toBe(true);
    b.loopAnimation = false;
    updateAnimationManager(manager, 1250);
    expect(looped.v).toBeCloseTo(2.5, 5);
    expect(held.v).toBe(10);
});
