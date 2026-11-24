// a-05, line 7: "Each evaluated clip is wrapped in an `AnimationGroup` and can be driven by a standalone `AnimationManager`, by a scene render loop, or by explicit deterministic updates."
// This probe takes "each clip is wrapped in an AnimationGroup" and "driven by a standalone AnimationManager".
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { data, moveClip } from "./_fx.ts";

test("one group per clip, and a manager with no scene drives one", () => {
    const { data: d, targets } = data([moveClip("one"), moveClip("two")]);
    const groups = createAnimationGroups(d);
    expect(groups.map((g) => g.name)).toEqual(["one", "two"]);
    const manager = createAnimationManager();
    addAnimationGroup(manager, groups[0]!);
    updateAnimationManager(manager, 500);
    expect(targets[0]!.p).toEqual([5, 0, 0]);
});
