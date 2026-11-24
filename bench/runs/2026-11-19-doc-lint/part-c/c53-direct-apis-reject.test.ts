// c-53. Line 620: "Direct skeleton/morph update APIs reject disposed targets explicitly."
// Checked: the public morph update calls setMorphTargetWeights and setMorphTargetWeight throw on morph targets marked
// disposed, and write nothing. The skeleton update call updateSkeletonBoneMatrices is not exported by the package;
// it is reached here through its internal module ("internal") and throws on a disposed skeleton.
import { setMorphTargetWeight, setMorphTargetWeights } from "@babylonjs/lite";
import type { MorphTargetData } from "@babylonjs/lite";
import { updateSkeletonBoneMatrices } from "#lite-src/skeleton/update-skeleton-bone-matrices.ts";
import { recordingEngine } from "./_fx";

test("disposed targets are rejected", () => {
    const rec = recordingEngine();
    const morph = { _disposed: true, count: 2, weights: new Float32Array(2), weightsBuffer: {} } as unknown as MorphTargetData;
    expect(() => setMorphTargetWeights(rec.engine, morph, [1, 1])).toThrow(/disposed/);
    expect(() => setMorphTargetWeight(rec.engine, morph, 0, 1)).toThrow(/disposed/);
    const skel = { _disposed: true, boneMatrices: new Float32Array(16), boneTexture: {} };
    expect(() => updateSkeletonBoneMatrices(rec.engine, skel as never, new Float32Array(16))).toThrow(/disposed/);
    expect(rec.calls).toEqual([]);
});
