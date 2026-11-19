// a-76, line 245: "export function getAnimationGroups(manager: AnimationManager): readonly AnimationGroup[];"
// Checked by the TypeScript compiler (types/typecheck.mjs): this file compiles only if the public package agrees.
import { getAnimationGroups } from "@babylonjs/lite";
import type { AnimationGroup, AnimationManager } from "@babylonjs/lite";

export const asDocumented: (manager: AnimationManager) => readonly AnimationGroup[] = getAnimationGroups;
