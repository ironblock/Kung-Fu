// a-77, line 246: "export function updateAnimationManager(manager: AnimationManager, deltaMs: number): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { updateAnimationManager } from "@babylonjs/lite";
import type { AnimationManager } from "@babylonjs/lite";

export const asDocumented: (manager: AnimationManager, deltaMs: number) => void = updateAnimationManager;
