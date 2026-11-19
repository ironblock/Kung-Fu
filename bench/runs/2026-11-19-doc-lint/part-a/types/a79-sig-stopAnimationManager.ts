// a-79, line 248: "export function stopAnimationManager(manager: AnimationManager): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { stopAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export const asDocumented: (manager: AnimationManager) => void = stopAnimationManager;
