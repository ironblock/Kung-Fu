// a-30, line 97: "export type PropertyAnimationInterpolation = "linear" | "step";"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
import type { PropertyAnimationInterpolation } from "@babylonjs/lite";

export const same: Equal<PropertyAnimationInterpolation, "linear" | "step"> = true;
