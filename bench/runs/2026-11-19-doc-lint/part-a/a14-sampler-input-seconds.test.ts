// a-14, line 33: "readonly input: Float32Array; // keyframe timestamps (seconds, monotonically increasing)"
// The behaviour in it: sampler input times are read as seconds. (Monotonic order is a rule for the data, not probed.)
// A key at 2 is reached after 2000 ms of updates, and 1000 ms is half way.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { data, lin } from "./_fx.ts";

test("sampler input times are seconds", () => {
    const clip = { name: "c", duration: 2, samplers: [lin([0, 0, 0], [10, 0, 0], 2)], channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }] };
    const { data: d, targets } = data([clip], { names: ["n"] });
    const manager = createAnimationManager();
    addAnimationGroup(manager, createAnimationGroups(d)[0]!);
    updateAnimationManager(manager, 1000);
    expect(targets[0]!.p[0]).toBeCloseTo(5, 5);
});
