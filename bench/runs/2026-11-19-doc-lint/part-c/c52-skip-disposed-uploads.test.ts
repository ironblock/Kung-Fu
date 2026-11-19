// c-52. Line 620: "Animation groups may outlive their mesh, so all controller, pose, and weighted-mixer upload paths skip
// disposed runtime resources."
// Checked on the two upload paths reachable from public calls: (1) a direct glTF group (controller) whose skeleton and
// morph targets are disposed keeps advancing and writing CPU state (node, morph weights array) but makes no GPU write;
// (2) a weighted glTF blend (mixer) on a disposed skeleton makes no GPU write. The pose path (skeleton-pose.ts) is
// internal and is not reached here.
import { addAnimationGroup, addAnimationGroups, createAnimationGroups, createAnimationManager, enableAnimationBlending, playAnimation, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import type { ClipSpec } from "./_fx";
import { gltf, morphBinding, moveClip, nodeRecorder, recordingEngine, rest, skeleton } from "./_fx";

test("controller path", () => {
    const rec = recordingEngine();
    const node = nodeRecorder();
    const skel = skeleton(0);
    skel.runtimeSkeleton = { _disposed: true, boneTexture: { name: "dead" } };
    const mb = morphBinding(0, 1);
    mb.runtimeMorphTargets = { _disposed: true, weightsBuffer: { name: "dead" } };
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
    const [g] = createAnimationGroups(gltf([clip], [rest()], { targets: [node], skeletons: [skel], morphBindings: [mb] }));
    const manager = createAnimationManager({ engine: rec.engine });
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 500);
    expect(g!.currentTime).toBe(0.5);
    expect(node.p[0]).toBeCloseTo(5, 5);
    expect(mb.weights[0]).toBeCloseTo(0.5, 6);
    expect(rec.calls).toEqual([]);
});

test("weighted mixer path", () => {
    const rec = recordingEngine();
    const skel = skeleton(0);
    skel.runtimeSkeleton = { _disposed: true };
    const groups = createAnimationGroups(gltf([moveClip("a", 0, 10), moveClip("b", 0, 20)], [rest()], { skeletons: [skel] }));
    const manager = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(manager);
    addAnimationGroups(manager, groups);
    playAnimation(groups[1]!);
    setAnimationWeight(groups[0]!, 0.5);
    updateAnimationManager(manager, 500);
    expect(groups[0]!.currentTime).toBe(0.5);
    expect(rec.calls).toEqual([]);
});
