// a-17, lines 44-50: "export interface AnimationClip {" "readonly name: string;" "readonly channels: readonly AnimationChannel[];" "readonly samplers: readonly AnimationSampler[];" "readonly duration: number; // max of all sampler input times (seconds)" "readonly frameRate?: number; // defaults to 60 for glTF clips" "}"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
// Fields are read with the documented types; channel and sampler element types are reached through the clip, as their own names are separate claims.
import type { AnimationClip } from "@babylonjs/lite";

declare const c: AnimationClip;
export const name: string = c.name;
export const samplerIdx: number | undefined = c.channels[0]?.samplerIdx;
export const nodeIdx: number | undefined = c.channels[0]?.nodeIdx;
export const input: Float32Array | undefined = c.samplers[0]?.input;
export const duration: number = c.duration;
export const frameRate: number | undefined = c.frameRate;
