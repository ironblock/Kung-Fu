// a-02, line 7: "Supports skeletal joint transforms, morph target weights, KHR_animation_pointer channels, and manual tracks bound to object property paths such as `position.x`, `position`, `rotationQuaternion`, or `scaling`."
// This probe takes the second item: morph target weights.
// A hand-made morph binding of two targets on node 0; a weights channel goes from [0, 0] to [1, 0.5] over 1 s.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { data, fakeEngine, lin, rest } from "./_fx.ts";

test("a weights channel sets the morph weights and uploads them", () => {
    const binding = { nodeIdx: 0, weightsBuffer: {}, weights: new Float32Array(2), targetCount: 2 };
    const clip = { name: "smile", duration: 1, samplers: [lin([0, 0], [1, 0.5])], channels: [{ samplerIdx: 0, nodeIdx: 0, path: 3 }] };
    const { data: d } = data([clip], { names: ["face"], nodes: [rest()], targets: [undefined], morphBindings: [binding] });
    const { engine, buffers } = fakeEngine();
    const manager = createAnimationManager({ engine });
    addAnimationGroup(manager, createAnimationGroups(d)[0]!);
    updateAnimationManager(manager, 500);
    expect(Array.from(binding.weights)).toEqual([0.5, 0.25]);
    expect(Array.from(buffers.at(-1)!.data)).toEqual([0.5, 0.25]);
});
