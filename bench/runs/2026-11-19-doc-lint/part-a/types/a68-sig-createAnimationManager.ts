// a-68, line 237: "export function createAnimationManager(options?: AnimationManagerOptions): AnimationManager;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { createAnimationManager } from "@babylonjs/lite";
import type { AnimationManager, AnimationManagerOptions } from "@babylonjs/lite";

export const asDocumented: (options?: AnimationManagerOptions) => AnimationManager = createAnimationManager;
