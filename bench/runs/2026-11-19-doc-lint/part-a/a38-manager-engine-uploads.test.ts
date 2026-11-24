// a-38, line 133: "/** Optional engine enables glTF skeleton/morph GPU uploads when manager is not scene-hosted. */"
// A manager with no scene, given a (fake) engine, uploads a morph clip's weights; the same manager without an engine cannot run that clip.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { data, fakeEngine, lin, rest } from "./_fx.ts";

function morphGroup() {
    const binding = { nodeIdx: 0, weightsBuffer: {}, weights: new Float32Array(1), targetCount: 1 };
    const clip = { name: "m", duration: 1, samplers: [lin([0], [1])], channels: [{ samplerIdx: 0, nodeIdx: 0, path: 3 }] };
    const { data: d } = data([clip], { names: ["face"], nodes: [rest()], targets: [undefined], morphBindings: [binding] });
    return createAnimationGroups(d)[0]!;
}

test("with the engine option the manager uploads morph weights", () => {
    const { engine, buffers } = fakeEngine();
    const manager = createAnimationManager({ engine });
    addAnimationGroup(manager, morphGroup());
    updateAnimationManager(manager, 500);
    expect(buffers.length).toBe(1);
    expect(buffers[0]!.data[0]).toBeCloseTo(0.5, 6);
});

test("without it the same clip cannot run", () => {
    const manager = createAnimationManager();
    addAnimationGroup(manager, morphGroup());
    expect(() => updateAnimationManager(manager, 500)).toThrow();
});
