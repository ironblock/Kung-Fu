// a-81, line 250: "export function enablePropertyAnimationBlending(manager: AnimationManager): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { enablePropertyAnimationBlending } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export const asDocumented: (manager: AnimationManager) => void = enablePropertyAnimationBlending;
