// b-70. Lines 483-493: "Weighted manual animation and deterministic cross-fade:" and the code under it.
// Run as written, with box.position.x animated: walkClip 0 -> 10 over 1 s, runClip a constant 100.
// Expected under the mixer's rule (sum of value x weight): after 150 ms the weights are 0.5 / 0.5 and
// x = 0.5 * 1.5 + 0.5 * 100 = 50.75; after 300 ms walk is 0, run is 1 and x = 100.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, crossFadeAnimationGroups, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

function run() {
    const manager = createAnimationManager();
    const box = { position: { x: 0 } };
    const walkClip = createPropertyAnimationClip("walk", [{ path: "position.x", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const runClip = createPropertyAnimationClip("run", [{ path: "position.x", keys: [{ time: 0, value: 100 }, { time: 1, value: 100 }] }]);
    const walk = createPropertyAnimationGroup(manager, box, walkClip);
    const runG = createPropertyAnimationGroup(manager, box, runClip);

    enablePropertyAnimationBlending(manager);
    setAnimationWeight(walk, 1);
    setAnimationWeight(runG, 0);
    crossFadeAnimationGroups(manager, walk, runG, { durationMs: 300 });

    const out: number[][] = [];
    updateAnimationManager(manager, 150);
    out.push([walk.weight, runG.weight, box.position.x]);
    updateAnimationManager(manager, 150);
    out.push([walk.weight, runG.weight, box.position.x]);
    return out;
}

test("the cross-fade moves the weights 1/0 -> 0/1 over 300 ms and blends the pose, the same every run", () => {
    const first = run();
    expect(first[0]![0]).toBe(0.5);
    expect(first[0]![1]).toBe(0.5);
    expect(first[0]![2]).toBeCloseTo(50.75, 4);
    expect(first[1]).toEqual([0, 1, 100]);
    expect(run()).toEqual(first);
});
