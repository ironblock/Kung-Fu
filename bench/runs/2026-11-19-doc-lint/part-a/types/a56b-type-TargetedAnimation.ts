// a-56, line 198: "export interface TargetedAnimation {"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
// The interface spans lines 198-203. A runtime probe of the same claim is a56-targeted-animation.test.ts.
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
import type { TargetedAnimation } from "@babylonjs/lite";

export const same: Equal<TargetedAnimation, { readonly target?: object; readonly targetName?: string; readonly nodeIndex?: number; readonly path: string }> = true;
