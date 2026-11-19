// a-72, line 241: "export function setAnimationTaskCategoryHandler(manager: AnimationManager, category: string, handler: AnimationTaskCategoryHandler): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { setAnimationTaskCategoryHandler } from "@babylonjs/lite";
import type { AnimationManager, AnimationTaskCategoryHandler } from "@babylonjs/lite";

export const asDocumented: (manager: AnimationManager, category: string, handler: AnimationTaskCategoryHandler) => void = setAnimationTaskCategoryHandler;
