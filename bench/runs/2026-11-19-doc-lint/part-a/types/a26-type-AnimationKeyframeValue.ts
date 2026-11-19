// a-26, line 87: "export type AnimationKeyframeValue = number | readonly number[];"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
import type { AnimationKeyframeValue } from "@babylonjs/lite";

export const same: Equal<AnimationKeyframeValue, number | readonly number[]> = true;
