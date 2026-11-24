// c-51. Line 620: "`disposeMeshGpu()` marks the last-owner `SkeletonData` or `MorphTargetData` as disposed before
// destroying its GPU resources."
// Internal design (_disposed), with a user-visible effect checked in c-52. Checked on a mesh stand-in whose skeleton and
// morph targets have one owner: when each GPU resource's destroy() runs, its owner is already marked _disposed. A
// skeleton with a second owner is not marked. The mesh's own geometry is given a second owner so that its buffers are
// not touched.
import { disposeMeshGpu } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

function resource(owner: { _disposed?: boolean }, seen: (boolean | undefined)[]) {
    return { destroy: () => void seen.push(owner._disposed) };
}

test("marked before destroyed", () => {
    const seen: (boolean | undefined)[] = [];
    const skeleton: Record<string, unknown> = { _skinBuffers: { _refCount: 2 } };
    skeleton.boneTexture = resource(skeleton, seen);
    const morphTargets: Record<string, unknown> = {};
    morphTargets.deltasBuffer = resource(morphTargets, seen);
    morphTargets.weightsBuffer = resource(morphTargets, seen);
    const mesh = { _gpu: { _refCount: 2 }, skeleton, morphTargets } as unknown as Mesh;
    disposeMeshGpu(mesh);
    expect(seen).toEqual([true, true, true]);
    expect(skeleton._disposed).toBe(true);
    expect(morphTargets._disposed).toBe(true);

    const shared: Record<string, unknown> = { _refCount: 2, boneTexture: resource({}, []) };
    disposeMeshGpu({ _gpu: { _refCount: 2 }, skeleton: shared } as unknown as Mesh);
    expect(shared._disposed).toBeUndefined();
});
