// a-70, line 239: "export function addAnimationTask(manager: AnimationManager, task: AnimationTask): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { addAnimationTask } from "@babylonjs/lite";
import type { AnimationManager, AnimationTask } from "@babylonjs/lite";

export const asDocumented: (manager: AnimationManager, task: AnimationTask) => void = addAnimationTask;
