// a-11, line 29: "export type InterpMode = 0 | 1 | 2;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
import type { InterpMode } from "@babylonjs/lite";

export const same: Equal<InterpMode, 0 | 1 | 2> = true;
