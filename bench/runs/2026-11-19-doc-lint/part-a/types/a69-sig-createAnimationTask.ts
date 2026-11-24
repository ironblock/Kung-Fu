// a-69, line 238: "export function createAnimationTask(update: AnimationTaskUpdate, options?: AnimationTaskOptions): AnimationTask;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { createAnimationTask } from "@babylonjs/lite";
import type { AnimationTask, AnimationTaskOptions, AnimationTaskUpdate } from "@babylonjs/lite";

export const asDocumented: (update: AnimationTaskUpdate, options?: AnimationTaskOptions) => AnimationTask = createAnimationTask;
