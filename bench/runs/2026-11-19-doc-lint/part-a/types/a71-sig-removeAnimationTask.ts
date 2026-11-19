// a-71, line 240: "export function removeAnimationTask(manager: AnimationManager, task: AnimationTask): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { removeAnimationTask } from "@babylonjs/lite";
import type { AnimationManager, AnimationTask } from "@babylonjs/lite";

export const asDocumented: (manager: AnimationManager, task: AnimationTask) => void = removeAnimationTask;
