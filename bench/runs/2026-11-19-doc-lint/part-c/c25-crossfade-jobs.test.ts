// c-25. Line 577: "`crossFadeAnimationGroups()` builds on the same weights by scheduling deterministic duration-based
// fade jobs inside the manager."
// Checked: from-group at weight 1, to-group at weight 0, a 1000 ms cross-fade. Each update of that manager moves both
// weights by elapsed/duration (0.75/0.25 after 250 ms); an update of another manager moves nothing; at the end the
// weights are exactly 0 and 1. The same steps give the same weights on a second run.
// Fair reading: the to-group fades from the weight it has; this probe sets it to 0 first, as a cross-fade starts.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, crossFadeAnimationGroups, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

function run(): number[][] {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    const from = createPropertyAnimationGroup(manager, { v: 0 }, clip);
    const to = createPropertyAnimationGroup(manager, { v: 0 }, clip);
    setAnimationWeight(to, 0);
    crossFadeAnimationGroups(manager, from, to, { durationMs: 1000 });
    const seen: number[][] = [];
    updateAnimationManager(createAnimationManager(), 500);
    seen.push([from.weight, to.weight]);
    updateAnimationManager(manager, 250);
    seen.push([from.weight, to.weight]);
    updateAnimationManager(manager, 750);
    seen.push([from.weight, to.weight]);
    updateAnimationManager(manager, 500);
    seen.push([from.weight, to.weight]);
    return seen;
}

test("fade jobs advance with the manager's elapsed time", () => {
    const seen = run();
    expect(seen).toEqual([
        [1, 0],
        [0.75, 0.25],
        [0, 1],
        [0, 1],
    ]);
    expect(run()).toEqual(seen);
});
