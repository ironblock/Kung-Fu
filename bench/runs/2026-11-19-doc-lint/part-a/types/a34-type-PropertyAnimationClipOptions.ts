// a-34, line 113: "export interface PropertyAnimationClipOptions {"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
// The interface spans lines 113-115.
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
import type { PropertyAnimationClipOptions } from "@babylonjs/lite";

export const same: Equal<PropertyAnimationClipOptions, { readonly frameRate?: number }> = true;
