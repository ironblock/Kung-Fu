// a-23, line 74: "export interface MorphBinding {"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import type { MorphBinding } from "@babylonjs/lite";

declare const m: MorphBinding;
export const nodeIdx: number = m.nodeIdx;
export const weightsBuffer: GPUBuffer = m.weightsBuffer;
export const targetCount: number = m.targetCount;
