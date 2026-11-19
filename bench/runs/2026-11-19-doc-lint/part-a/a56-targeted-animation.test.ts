// a-56, lines 198-203: "export interface TargetedAnimation {" with target?, targetName?, nodeIndex?, path
// A glTF group's entries carry target, targetName, nodeIndex and path; a property group's carry target and path.
import { createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import { data, moveClip } from "./_fx.ts";

test("targetedAnimations entries have the documented fields", () => {
    const { data: d, targets } = data([moveClip()]);
    const g = createAnimationGroups(d)[0]!;
    expect(g.targetedAnimations[0]).toEqual({ target: targets[0], targetName: "root", nodeIndex: 0, path: "translation" });
    const obj = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    const p = createPropertyAnimationGroup(createAnimationManager(), obj, clip);
    expect(p.targetedAnimations[0]!.target).toBe(obj);
    expect(p.targetedAnimations[0]!.path).toBe("v");
});
