// a-37, line 132: "export interface AnimationManagerOptions {"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
// The interface spans lines 132-139.
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
import type { AnimationManagerOptions, EngineContext } from "@babylonjs/lite";

export const same: Equal<AnimationManagerOptions, { readonly engine?: EngineContext; readonly fixedDeltaMs?: number; readonly onUpdate?: (deltaMs: number) => void }> = true;
