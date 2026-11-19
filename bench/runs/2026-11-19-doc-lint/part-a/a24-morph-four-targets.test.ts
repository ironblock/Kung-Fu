// a-24, line 77: "readonly targetCount: number; // max 4 supported"
// Read in its favour: a binding of 4 targets is supported, all 4 weights animate.
// (Not asserted: what happens above 4. The evaluation code read has no cap at 4.)
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { data, fakeEngine, lin, rest } from "./_fx.ts";

test("a morph binding of 4 targets animates all 4 weights", () => {
    const binding = { nodeIdx: 0, weightsBuffer: {}, weights: new Float32Array(4), targetCount: 4 };
    const clip = { name: "m", duration: 1, samplers: [lin([0, 0, 0, 0], [1, 0.5, 0.25, 0.75])], channels: [{ samplerIdx: 0, nodeIdx: 0, path: 3 }] };
    const { data: d } = data([clip], { names: ["face"], nodes: [rest()], targets: [undefined], morphBindings: [binding] });
    const { engine } = fakeEngine();
    const manager = createAnimationManager({ engine });
    addAnimationGroup(manager, createAnimationGroups(d)[0]!);
    updateAnimationManager(manager, 1000 - 1e-9);
    expect(Array.from(binding.weights).map((w) => Math.round(w * 1000) / 1000)).toEqual([1, 0.5, 0.25, 0.75]);
});
