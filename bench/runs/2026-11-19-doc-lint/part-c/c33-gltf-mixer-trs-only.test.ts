// c-33. Line 586: "The current glTF mixer covers skeleton TRS channels; morph target blending is planned as a
// follow-on mixer pass."
// Checked: a weighted group (0.5) whose clip has a translation channel and a morph-weights channel on one node. With
// enableAnimationBlending the translation is mixed into the uploaded pose (x = 5) and the morph weights are not
// blended: nothing is written to the morph binding or its buffer. The plan is not checked.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, enableAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, morphBinding, recordingEngine, rest, rootPose, skeleton } from "./_fx";

test("TRS mixed, morph weights not", () => {
    const clip: ClipSpec = {
        name: "c",
        duration: 1,
        channels: [
            { samplerIdx: 0, nodeIdx: 0, path: 0 },
            { samplerIdx: 1, nodeIdx: 0, path: 3 },
        ],
        samplers: [
            { input: new Float32Array([0, 1]), output: new Float32Array([10, 0, 0, 10, 0, 0]), interpolation: 0 },
            { input: new Float32Array([0, 1]), output: new Float32Array([1, 1, 1, 1]), interpolation: 0 },
        ],
    };
    const rec = recordingEngine();
    const skel = skeleton(0);
    const mb = morphBinding(0, 2);
    const [group] = createAnimationGroups(gltf([clip], [rest()], { skeletons: [skel], morphBindings: [mb] }));
    const manager = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(manager);
    addAnimationGroup(manager, group!);
    setAnimationWeight(group!, 0.5);
    updateAnimationManager(manager, 100);
    expect(rootPose(skel.boneMatrices).tx).toBeCloseTo(5, 4);
    expect(Array.from(mb.weights)).toEqual([0, 0]);
    expect(rec.calls.filter((c) => c.method === "writeBuffer")).toEqual([]);
});
