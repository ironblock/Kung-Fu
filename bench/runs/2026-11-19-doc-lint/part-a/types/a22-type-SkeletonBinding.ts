// a-22, line 66: "export interface SkeletonBinding {"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import type { SkeletonBinding } from "@babylonjs/lite";

declare const s: SkeletonBinding;
export const fields = [s.jointNodes, s.inverseBindMatrices, s.invMeshWorld, s.boneTexture, s.boneCount];
