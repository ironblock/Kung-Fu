// a-73, line 242: "export function addAnimationGroup(manager: AnimationManager, group: AnimationGroup): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { addAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

export const asDocumented: (manager: AnimationManager, group: AnimationGroup) => void = addAnimationGroup;
