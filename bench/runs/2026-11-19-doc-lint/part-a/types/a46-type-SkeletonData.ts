// a-46, line 164: "export interface SkeletonData {"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import type { SkeletonData } from "@babylonjs/lite";

declare const s: SkeletonData;
export const fields = [s.boneTexture, s.boneCount, s.jointsBuffer, s.weightsBuffer, s.joints1Buffer, s.weights1Buffer];
