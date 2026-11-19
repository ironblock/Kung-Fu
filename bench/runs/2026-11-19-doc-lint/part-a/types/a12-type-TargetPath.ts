// a-12, line 30: "export type TargetPath = 0 | 1 | 2 | 3;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
import type { TargetPath } from "@babylonjs/lite";

export const same: Equal<TargetPath, 0 | 1 | 2 | 3> = true;
