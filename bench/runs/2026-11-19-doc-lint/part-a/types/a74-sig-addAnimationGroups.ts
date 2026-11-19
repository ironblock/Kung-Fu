// a-74, line 243: "export function addAnimationGroups(manager: AnimationManager, groups: readonly AnimationGroup[]): void;"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { addAnimationGroups } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

export const asDocumented: (manager: AnimationManager, groups: readonly AnimationGroup[]) => void = addAnimationGroups;
