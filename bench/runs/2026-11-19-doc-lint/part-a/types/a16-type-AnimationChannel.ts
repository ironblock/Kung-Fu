// a-16, lines 38-42: "export interface AnimationChannel {" "readonly samplerIdx: number;" "readonly nodeIdx: number;" "readonly path: TargetPath;" "}"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import type { AnimationChannel, TargetPath } from "@babylonjs/lite";

declare const c: AnimationChannel;
export const samplerIdx: number = c.samplerIdx;
export const nodeIdx: number = c.nodeIdx;
export const path: TargetPath = c.path;
