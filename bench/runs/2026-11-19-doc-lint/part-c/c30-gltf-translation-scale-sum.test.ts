// c-30. Line 586: "translation and scale use weighted sums"
// Checked with enableAnimationBlending: weights 0.5 and 0.25; clip a holds x = 10 and scale 2, clip b holds x = 20 and
// scale 4. Uploaded: x = 0.5*10 + 0.25*20 = 10, scale = 0.5*2 + 0.25*4 = 2.
import { addAnimationGroups, createAnimationGroups, createAnimationManager, enableAnimationBlending, playAnimation, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, recordingEngine, rest, rootPose, skeleton } from "./_fx";

function hold(name: string, x: number, s: number): ClipSpec {
    return {
        name,
        duration: 1,
        channels: [
            { samplerIdx: 0, nodeIdx: 0, path: 0 },
            { samplerIdx: 1, nodeIdx: 0, path: 2 },
        ],
        samplers: [
            { input: new Float32Array([0, 1]), output: new Float32Array([x, 0, 0, x, 0, 0]), interpolation: 0 },
            { input: new Float32Array([0, 1]), output: new Float32Array([s, s, s, s, s, s]), interpolation: 0 },
        ],
    };
}

test("weighted sums", () => {
    const rec = recordingEngine();
    const skel = skeleton(0);
    const groups = createAnimationGroups(gltf([hold("a", 10, 2), hold("b", 20, 4)], [rest()], { skeletons: [skel] }));
    const manager = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(manager);
    addAnimationGroups(manager, groups);
    playAnimation(groups[1]!);
    setAnimationWeight(groups[0]!, 0.5);
    setAnimationWeight(groups[1]!, 0.25);
    updateAnimationManager(manager, 100);
    const pose = rootPose(skel.boneMatrices);
    expect(pose.tx).toBeCloseTo(10, 4);
    expect(pose.sx).toBeCloseTo(2, 4);
});
