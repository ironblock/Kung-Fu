// a-07, line 7: "Each evaluated clip is wrapped in an `AnimationGroup` and can be driven by a standalone `AnimationManager`, by a scene render loop, or by explicit deterministic updates."
// This probe takes "explicit deterministic updates": the caller gives each step, and the same steps give the same pose.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { data, moveClip } from "./_fx.ts";

function run(steps: number[]): number[] {
    const { data: d, targets } = data([moveClip()]);
    const manager = createAnimationManager();
    addAnimationGroup(manager, createAnimationGroups(d)[0]!);
    for (const s of steps) {
        updateAnimationManager(manager, s);
    }
    return targets[0]!.p;
}

test("the same caller-given steps give the same pose, set by the sum of the steps", () => {
    const steps = [16, 33, 100];
    const first = run(steps);
    expect(run(steps)).toEqual(first);
    expect(first[0]).toBeCloseTo(1.49, 4);
});
