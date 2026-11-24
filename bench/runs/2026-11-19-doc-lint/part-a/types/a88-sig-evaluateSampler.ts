// a-88, line 272: "export function evaluateSampler("
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
// The signature spans lines 272-279; it is copied here whole, without its comments.
import { evaluateSampler } from "@babylonjs/lite";
import type { AnimationSampler } from "@babylonjs/lite";

export const asDocumented: (sampler: AnimationSampler, t: number, stride: number, isQuat: boolean, dst: Float32Array, dstOffset: number) => void = evaluateSampler;
