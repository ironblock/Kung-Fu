// c-116. Line 746: "**Bad path failure**: Verify invalid property paths throw during binding"
// Checked: binding (createPropertyAnimationGroup) a clip whose path does not exist on the target throws.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

test("bad path throws at binding", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "nope", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    expect(() => createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, clip)).toThrow(/nope/);
});
