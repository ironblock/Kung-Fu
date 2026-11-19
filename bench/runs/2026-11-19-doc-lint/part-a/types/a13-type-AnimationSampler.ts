// a-13, lines 32-36: "export interface AnimationSampler {" "readonly input: Float32Array; // keyframe timestamps (seconds, monotonically increasing)" "readonly output: Float32Array; // packed values; CUBICSPLINE: [inTangent, value, outTangent] per key" "readonly interpolation: InterpMode;" "}"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import type { AnimationSampler, InterpMode } from "@babylonjs/lite";

declare const s: AnimationSampler;
export const input: Float32Array = s.input;
export const output: Float32Array = s.output;
export const interpolation: InterpMode = s.interpolation;
