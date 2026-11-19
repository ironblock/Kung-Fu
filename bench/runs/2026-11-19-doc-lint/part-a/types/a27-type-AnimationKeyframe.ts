// a-27, line 89: "export interface AnimationKeyframe {"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
// The interface spans lines 89-95.
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
import type { AnimationKeyframe, AnimationKeyframeValue } from "@babylonjs/lite";

export const same: Equal<AnimationKeyframe, { readonly time?: number; readonly frame?: number; readonly value: AnimationKeyframeValue }> = true;
