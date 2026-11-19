// a-47, lines 173-177: "export interface MorphTargetData {" "readonly texture: GPUTexture;" "readonly count: number;" "readonly weightsBuffer: GPUBuffer;" "}"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import type { MorphTargetData } from "@babylonjs/lite";

declare const m: MorphTargetData;
export const texture: GPUTexture = m.texture;
export const count: number = m.count;
export const weightsBuffer: GPUBuffer = m.weightsBuffer;
