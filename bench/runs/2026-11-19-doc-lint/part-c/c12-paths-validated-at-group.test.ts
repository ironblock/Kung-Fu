// c-12. Line 559: "Manual property paths are validated when the group is created."
// Checked: a clip whose path names nothing is made without error; making a group from it on a target that lacks the
// path throws then, before any update.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

test("validation happens at group creation", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "nothing.here", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    expect(() => createPropertyAnimationGroup(createAnimationManager(), { position: { x: 0 } }, clip)).toThrow(/nothing\.here/);
});
