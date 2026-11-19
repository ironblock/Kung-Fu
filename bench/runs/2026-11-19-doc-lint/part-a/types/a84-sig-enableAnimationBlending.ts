// a-84, line 253: "export function enableAnimationBlending(manager: AnimationManager): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { enableAnimationBlending } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export const asDocumented: (manager: AnimationManager) => void = enableAnimationBlending;
