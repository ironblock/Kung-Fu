// a-78, line 247: "export function startAnimationManager(manager: AnimationManager): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { startAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export const asDocumented: (manager: AnimationManager) => void = startAnimationManager;
