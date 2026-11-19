// a-75, line 244: "export function removeAnimationGroup(manager: AnimationManager, group: AnimationGroup): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { removeAnimationGroup } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

export const asDocumented: (manager: AnimationManager, group: AnimationGroup) => void = removeAnimationGroup;
