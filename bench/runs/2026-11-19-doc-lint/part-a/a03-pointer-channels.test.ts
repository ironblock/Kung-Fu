// a-03, line 7: "Supports skeletal joint transforms, morph target weights, KHR_animation_pointer channels, and manual tracks bound to object property paths such as `position.x`, `position`, `rotationQuaternion`, or `scaling`."
// This probe takes the third item: KHR_animation_pointer channels.
// The loader turns such a channel into a channel with path 4 and a writer; this probe builds that channel by hand.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { data, lin, rest } from "./_fx.ts";

test("a pointer channel's writer receives the sampled value", () => {
    const seen: number[] = [];
    const clip = {
        name: "fov",
        duration: 1,
        samplers: [lin([0], [10])],
        channels: [{ samplerIdx: 0, nodeIdx: -1, path: 4, pointerArity: 1, pointerWriter: (out: Float32Array, o: number) => seen.push(out[o]!) }],
    };
    const { data: d } = data([clip], { names: ["n"], nodes: [rest()], targets: [undefined] });
    const manager = createAnimationManager();
    addAnimationGroup(manager, createAnimationGroups(d)[0]!);
    updateAnimationManager(manager, 250);
    expect(seen.at(-1)).toBeCloseTo(2.5, 6);
});
