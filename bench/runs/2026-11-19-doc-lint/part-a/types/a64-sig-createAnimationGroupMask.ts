// a-64, line 226: "export function createAnimationGroupMask(names?: string[], mode?: AnimationGroupMaskMode): AnimationGroupMask;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { createAnimationGroupMask } from "@babylonjs/lite";
import type { AnimationGroupMask, AnimationGroupMaskMode } from "@babylonjs/lite";

export const asDocumented: (names?: string[], mode?: AnimationGroupMaskMode) => AnimationGroupMask = createAnimationGroupMask;
