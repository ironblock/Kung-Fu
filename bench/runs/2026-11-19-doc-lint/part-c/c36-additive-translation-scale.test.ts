// c-36. Line 588: "Translation and scale add `sample - reference` by weight;"
// Checked with enableAnimationBlending: one additive group of weight 0.5, reference frame 0, its clip moving x from 0
// to 10 and scale from 1 to 3 over 1 s. At 0.5 s: x = rest 0 + (5 - 0) * 0.5 = 2.5; scale = rest 1 + (2 - 1) * 0.5 = 1.5.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, enableAnimationBlending, setAnimationAdditive, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, recordingEngine, rest, rootPose, skeleton } from "./_fx";

test("rest + (sample - reference) * weight", () => {
    const clip: ClipSpec = {
        name: "add",
        duration: 1,
        channels: [
            { samplerIdx: 0, nodeIdx: 0, path: 0 },
            { samplerIdx: 1, nodeIdx: 0, path: 2 },
        ],
        samplers: [
            { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 },
            { input: new Float32Array([0, 1]), output: new Float32Array([1, 1, 1, 3, 3, 3]), interpolation: 0 },
        ],
    };
    const rec = recordingEngine();
    const skel = skeleton(0);
    const [group] = createAnimationGroups(gltf([clip], [rest()], { skeletons: [skel] }));
    const manager = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(manager);
    setAnimationAdditive(group!, { referenceFrame: 0 });
    setAnimationWeight(group!, 0.5);
    addAnimationGroup(manager, group!);
    updateAnimationManager(manager, 500);
    const pose = rootPose(skel.boneMatrices);
    expect(pose.tx).toBeCloseTo(2.5, 4);
    expect(pose.sx).toBeCloseTo(1.5, 4);
});
