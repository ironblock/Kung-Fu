// c-122. Line 752: "**Disposed animated resources**: Verify a surviving animation group can continue evaluating CPU
// state without uploading to a destroyed bone texture or morph-weight buffer"
// Checked: a glTF group whose skeleton and morph targets were disposed through disposeMeshGpu (mesh stand-in sharing
// them as runtimeSkeleton / runtimeMorphTargets) keeps advancing and writing the node and morph CPU weights, and makes
// no GPU write.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, disposeMeshGpu, updateAnimationManager } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, morphBinding, nodeRecorder, recordingEngine, rest, skeleton } from "./_fx";

test("CPU state continues, no uploads", () => {
    const destroy = { destroy: () => {} };
    const runtimeSkeleton = { boneTexture: { ...destroy }, _skinBuffers: { _refCount: 2 } };
    const runtimeMorph = { deltasBuffer: { ...destroy }, weightsBuffer: { ...destroy } };
    disposeMeshGpu({ _gpu: { _refCount: 2 }, skeleton: runtimeSkeleton, morphTargets: runtimeMorph } as unknown as Mesh);
    const skel = skeleton(0);
    skel.runtimeSkeleton = runtimeSkeleton;
    const mb = morphBinding(0, 1);
    mb.runtimeMorphTargets = runtimeMorph;
    const clip: ClipSpec = {
        name: "c",
        duration: 1,
        channels: [
            { samplerIdx: 0, nodeIdx: 0, path: 0 },
            { samplerIdx: 1, nodeIdx: 0, path: 3 },
        ],
        samplers: [
            { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 },
            { input: new Float32Array([0, 1]), output: new Float32Array([0, 1]), interpolation: 0 },
        ],
    };
    const node = nodeRecorder();
    const rec = recordingEngine();
    const [g] = createAnimationGroups(gltf([clip], [rest()], { targets: [node], skeletons: [skel], morphBindings: [mb] }));
    const manager = createAnimationManager({ engine: rec.engine });
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 300);
    updateAnimationManager(manager, 300);
    expect(g!.currentTime).toBeCloseTo(0.6, 6);
    expect(node.p[0]).toBeCloseTo(6, 5);
    expect(mb.weights[0]).toBeCloseTo(0.6, 5);
    expect(rec.calls).toEqual([]);
});
